<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Client;
use App\Models\AccountProduct;
use App\Models\AccountTransaction;
use App\Models\User;
use App\Models\UniversalBankerDailyBalance;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\Validators\ExcelRowValidator;
use Illuminate\Support\Arr;


class ExcelProcessingService
{
  /**
   * Report date for the current processing
   * 
   * @var string|null
   */
  private ?string $reportDate = null;
  private array $universalBankerCache = [];
  private array $clientCache = [];
  private array $accountCache = [];
  private array $processedNips = [];

  /**
   * Excel column mappings
   */
  public const COL_CLIENT_CIF = 'textbox4';
  public const COL_CLIENT_NAME = 'textbox38';
  public const COL_ACCOUNT_NUMBER = 'textbox15';
  public const COL_PN_RELATIONSHIP_OFFICER = 'pn_relationship_officer';
  public const COL_BALANCE = 'balance';
  public const COL_AVAIL_BALANCE = 'availbalance';

  /**
   * EPSILON constant for floating point comparisons
   */
  private const EPSILON = 0.0001;

  /**
   * Generate preview data from the uploaded Excel file.
   * Does not save anything to the main database tables yet.
   *
   * @param UploadedFile $file
   * @return array ['report_date', 'valid_rows', 'summary', 'errors', 'universal_bankers_to_update_ids']
   * @throws \InvalidArgumentException
   */
  public function parseAndValidateFile(UploadedFile $file, $date): array
  {
    $this->reportDate = Carbon::parse($date)->format('Y-m-d');

    $validRowsForPreview = [];
    $processingErrors = [];
    $summary = [
      'total_rows_in_excel' => 0,
      'potential_accounts_to_update' => 0,
      'potential_new_transactions' => 0,
      'skipped_rows' => 0,
    ];
    $universalBankersAffectedPreview = [];

    try {

      $this->preloadUniversalBankers();

      $excelDataCollections = Excel::toCollection(new \App\Imports\AccountDataImport, $file);

      if ($excelDataCollections->isEmpty() || $excelDataCollections->first()->isEmpty()) {
        throw new \InvalidArgumentException('File Excel kosong atau sheet pertama tidak mengandung data.');
      }

      $excelDataRows = $excelDataCollections->first();
      $summary['total_rows_in_excel'] = $excelDataRows->count();

      foreach ($excelDataRows as $index => $rowObject) {
        $rowNumber = $index + 2;
        $row = collect($rowObject->toArray())
          ->filter(function ($value, $key) {
            $requiredKeys = [
              self::COL_CLIENT_CIF,
              self::COL_CLIENT_NAME,
              self::COL_ACCOUNT_NUMBER,
              self::COL_PN_RELATIONSHIP_OFFICER,
              self::COL_BALANCE,
              self::COL_AVAIL_BALANCE
            ];
            return in_array($key, $requiredKeys) && $value !== null;
          })
          ->toArray();
        $rowDataForPreview = $row;
        // Validate the row data
        $validator = new ExcelRowValidator($row);
        if (!$validator->isValid()) {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'errors' => $validator->getErrors(),
            'data' => $row
          ];

          Log::warning("Baris {$rowNumber} tidak valid: " . json_encode($validator->getErrors()), [
            'row_data' => $row
          ]);
          $summary['skipped_rows']++;
          continue;
        }

        $validatedData = $validator->getValidatedData();

        // Check for empty or invalid PN_RO
        $pnRoValue = $validatedData[self::COL_PN_RELATIONSHIP_OFFICER] ?? '';
        if (empty($pnRoValue) || trim($pnRoValue) === '-') {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'error' => "PN Relationship Officer kosong atau tidak valid.",
            'data' => $row
          ];
          $summary['skipped_rows']++;
          Log::warning("Baris {$rowNumber} PN Relationship Officer kosong atau tidak valid.", [
            'row_data' => $row
          ]);
          continue;
        }

        // Find the Universal Banker
        $universalBanker = $this->findUniversalBanker($pnRoValue);
        if (!$universalBanker) {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'error' => "UB tidak ditemukan untuk kode: " . ($pnRoValue ?? 'N/A'),
            'data' => $row
          ];
          $summary['skipped_rows']++;
          Log::warning("Baris {$rowNumber} UB tidak ditemukan untuk kode: {$pnRoValue}", [
            'row_data' => $row
          ]);
          continue;
        }

        // Find the Client
        $clientCif = $validatedData[self::COL_CLIENT_CIF] ?? '';
        $client = $this->findClient($clientCif);

        if (!$client) {
          $rowDataForPreview['status_client'] = 'not_found';
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'error' => "Klien dengan CIF '{$clientCif}' tidak ditemukan.",
            'data' => $row
          ];
          $summary['skipped_rows']++;
          Log::warning("Baris {$rowNumber} Klien tidak ditemukan untuk CIF: {$clientCif}", [
            'row_data' => $row
          ]);
          continue;
        } else {
          $rowDataForPreview['status_client'] = 'found';
          $rowDataForPreview['db_client_id'] = $client->id;
          $rowDataForPreview['db_client_name'] = $client->name;
        }
        // Find or prepare new account
        $accountNumber = $validatedData[self::COL_ACCOUNT_NUMBER] ?? '';
        $account = $this->findAccount($accountNumber);

        // Process balance information
        $currentBalanceFromExcel = $this->formatCurrency($validatedData[self::COL_BALANCE]);
        $availableBalanceFromExcel = $this->formatCurrency($validatedData[self::COL_AVAIL_BALANCE]);
        $rowDataForPreview['excel_current_balance'] = $currentBalanceFromExcel;
        $rowDataForPreview['excel_available_balance'] = $availableBalanceFromExcel;

        if ($account) {
          $this->prepareExistingAccountPreview(
            $rowDataForPreview,
            $account,
            $universalBanker,
            $currentBalanceFromExcel,
            $availableBalanceFromExcel,
            $summary
          );
        }

        // Prepare data for frontend
        $this->prepareRowDataForFrontend(
          $rowDataForPreview,
          $row,
          $currentBalanceFromExcel,
          $availableBalanceFromExcel,
          $client,
          $account,
          $index,
          $validatedData,
          $universalBanker
        );
        $validRowsForPreview[] = $rowDataForPreview;
        Log::info("Baris {$rowNumber} berhasil diproses dan ditambahkan ke preview.", [
          'row_data' => $rowDataForPreview
        ]);
        $universalBankersAffectedPreview[$universalBanker->id] = true;
      }
      return [
        'report_date' => $this->reportDate,
        'valid_rows' => $validRowsForPreview,
        'summary' => $summary,
        'errors' => $processingErrors,
        'universal_bankers_to_update_ids' => array_keys($universalBankersAffectedPreview)
      ];
    } catch (\Exception $e) {
      Log::error('Error generating preview data: ' . $e->getMessage(), [
        'exception' => $e,
        'file' => $file->getClientOriginalName()
      ]);

      throw $e;
    }
  }
  private function preloadUniversalBankers(): void
  {
    $universalBankers = User::role('roles', fn($q) => $q->where('name', 'universal_banker'))
      ->get()
      ->keyBy('nip');

    $this->universalBankerCache = $universalBankers->toArray();

    Log::info("Pre-loaded " . count($this->universalBankerCache) . " Universal Bankers");
  }

  /**
   * Pre-load clients dan accounts berdasarkan data Excel
   */
  private function preloadClientsAndAccounts($excelDataRows): void
  {
    $cifs = [];
    $accountNumbers = [];

    foreach ($excelDataRows as $row) {
      $rowArray = $row->toArray();
      if (isset($rowArray[self::COL_CLIENT_CIF])) {
        $cifs[] = $rowArray[self::COL_CLIENT_CIF];
      }
      if (isset($rowArray[self::COL_ACCOUNT_NUMBER])) {
        $accountNumbers[] = $rowArray[self::COL_ACCOUNT_NUMBER];
      }
    }

    // Pre-load clients
    $clients = Client::whereIn('cif', array_unique($cifs))->get()->keyBy('cif');
    $this->clientCache = $clients->toArray();

    // Pre-load accounts
    $accounts = Account::whereIn('account_number', array_unique($accountNumbers))->get()->keyBy('account_number');
    $this->accountCache = $accounts->toArray();

    Log::info("Pre-loaded " . count($this->clientCache) . " clients and " . count($this->accountCache) . " accounts");
  }

  /**
   * Find Universal Banker by their code (NIP) from PN_RO field
   *
   * @param string $pnRoExcel
   * @return User|null
   */
  public function findUniversalBanker(string $pnRoExcel): ?User
  {
    // Skip processing if empty or just a dash
    if (empty($pnRoExcel) || trim($pnRoExcel) === '-') {
      Log::info("Skipping row with empty PN Relationship Officer");
      return null;
    }

    try {
      $officerInfo = explode(' - ', $pnRoExcel);
      $officerCode = trim($officerInfo[0]);

      // Check for empty officer code after parsing
      if (empty($officerCode)) {
        Log::warning("Empty officer code after parsing '{$pnRoExcel}'");
        return null;
      }

      // Find Universal Banker with the given NIP
      $universalBanker = User::where('nip', $officerCode)
        ->whereHas('roles', fn($q) => $q->where('name', 'universal_banker'))
        ->first();

      if (!$universalBanker) {
        Log::warning("Universal Banker tidak ditemukan untuk kode NIP: {$officerCode}");
        return null;
      }

      return $universalBanker;
    } catch (\Exception $e) {
      Log::error("Error finding Universal Banker: " . $e->getMessage(), ['pnRoExcel' => $pnRoExcel]);
      return null;
    }
  }

  /**
   * Find client by CIF
   * 
   * @param string $cif
   * @return Client|null
   */
  public function findClient(string $cif): ?Client
  {
    if (empty($cif)) {
      return null;
    }

    return Client::where('cif', $cif)->first();
  }

  /**
   * Find account by account number
   * 
   * @param string $accountNumber
   * @return Account|null
   */
  public function findAccount(string $accountNumber): ?Account
  {
    if (empty($accountNumber)) {
      return null;
    }

    return Account::where('account_number', $accountNumber)
      ->first();
  }


  /**
   * Prepare preview data for an existing account
   * 
   * @param array &$rowDataForPreview Reference to row data array
   * @param Account $account The account object
   * @param User $universalBanker The Universal Banker
   * @param float $currentBalanceFromExcel Current balance from Excel
   * @param float $availableBalanceFromExcel Available balance from Excel
   * @param array &$summary Reference to summary data
   * @return void
   */
  private function prepareExistingAccountPreview(
    array &$rowDataForPreview,
    Account $account,
    User $universalBanker,
    float $currentBalanceFromExcel,
    float $availableBalanceFromExcel,
    array &$summary
  ): void {
    $rowDataForPreview['status_account'] = 'found';
    $rowDataForPreview['db_account_id'] = $account->id;
    $rowDataForPreview['db_previous_balance'] = (float)$account->current_balance;

    // Validate UB ownership
    if ($account->universal_banker_id != $universalBanker->id) {
      $rowDataForPreview['warning_ub_mismatch'] = "UB di DB: {$account->universalBanker?->name} (ID: {$account->universal_banker_id}), UB di Excel: {$universalBanker->name} (ID: {$universalBanker->id}).";
    }

    // Calculate transaction amount
    $transactionAmount = $currentBalanceFromExcel - (float)$account->current_balance;
    $rowDataForPreview['calculated_transaction_amount'] = $transactionAmount;

    if (abs($transactionAmount) > self::EPSILON) {
      $summary['potential_new_transactions']++;
      $rowDataForPreview['action_description'] = ($transactionAmount > 0 ? "Kredit " : "Debit ") . number_format(abs($transactionAmount), 2);
    } else {
      $rowDataForPreview['action_description'] = "Tidak ada perubahan saldo.";
    }

    if (
      abs((float)$account->current_balance - $currentBalanceFromExcel) > self::EPSILON ||
      abs((float)$account->available_balance - $availableBalanceFromExcel) > self::EPSILON
    ) {
      $summary['potential_accounts_to_update']++;
    }
  }

  /**
   * Prepare row data for frontend display
   * 
   * @param array &$rowDataForPreview Reference to row data array
   * @param array $originalRow Original Excel row
   * @param float $currentBalanceFromExcel Current balance from Excel
   * @param float $availableBalanceFromExcel Available balance from Excel
   * @param Client $client Client object
   * @param Account|null $account Account object or null for new accounts
   * @param int $index Row index
   * @param array $validatedData Validated data from validator
   * @param User $universalBanker Universal Banker object
   * @return void
   */
  private function prepareRowDataForFrontend(
    array &$rowDataForPreview,
    array $originalRow,
    float $currentBalanceFromExcel,
    float $availableBalanceFromExcel,
    Client $client,
    ?Account $account,
    int $index,
    array $validatedData,
    User $universalBanker
  ): void {
    $rowDataForPreview['original_excel_row'] = $originalRow;
    $rowDataForPreview['editable_current_balance'] = $currentBalanceFromExcel;
    $rowDataForPreview['editable_available_balance'] = $availableBalanceFromExcel;
    $rowDataForPreview['is_editing'] = false;
    $rowDataForPreview['id_for_frontend_key'] = $client->id . '_' . ($account ? $account->id : 'new_' . $index);
    $rowDataForPreview['client_cif'] = $validatedData[self::COL_CLIENT_CIF];
    $rowDataForPreview['account_number'] = $validatedData[self::COL_ACCOUNT_NUMBER];
    $rowDataForPreview['universal_banker_name'] = $universalBanker->name;
    $rowDataForPreview['universal_banker_id_for_commit'] = $universalBanker->id;
  }

  /**
   * Finalize and commit account data processing after user confirmation.
   *
   * @param IlluminateCollection $dataToProcess Data that has been reviewed (and potentially edited) by the user.
   * @param string $reportDate The report date determined during preview.
   * @return int Number of successfully processed (committed) rows.
   * @throws \Exception
   */
  public function finalizeAccountData(IlluminateCollection $dataToProcess, string $reportDate): int
  {
    $this->reportDate = $reportDate;
    $processedCount = 0;
    $universalBankersAffected = [];

    DB::beginTransaction();
    try {
      foreach ($dataToProcess as $index => $rowFromPreview) {
        // Skip processing if the UB is invalid or missing
        $universalBankerId = Arr::get($rowFromPreview, 'universal_banker_id_for_commit');
        if (empty($universalBankerId)) {
          Log::warning("Finalisasi: Universal Banker ID tidak tersedia di data.", ['data' => $rowFromPreview]);
          continue;
        }

        $universalBanker = User::find($universalBankerId);
        if (!$universalBanker) {
          Log::warning("Finalisasi: UB tidak ditemukan untuk ID: {$universalBankerId}", ['data' => $rowFromPreview]);
          continue;
        }

        // Ensure we have a single User model, not a collection
        if ($universalBanker instanceof \Illuminate\Database\Eloquent\Collection) {
          if ($universalBanker->isEmpty()) {
            Log::warning("Finalisasi: UB koleksi kosong untuk ID: {$universalBankerId}", ['data' => $rowFromPreview]);
            continue;
          }
          $universalBanker = $universalBanker->first();
        }

        // Process client data
        $client = $this->processClientData($rowFromPreview);
        if (!$client) {
          continue;
        }

        // Process account data
        $accountProcessed = $this->processAccountData(
          $rowFromPreview,
          $client,
          $universalBanker,
          $universalBankersAffected,
          $processedCount
        );

        if ($accountProcessed) {
          $processedCount++;
        }
      }

      // Update daily balances and commit transaction
      $this->updateUniversalBankerDailyBalances($universalBankersAffected);
      DB::commit();
      return $processedCount;
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Finalisasi Gagal: Transaksi dibatalkan: ' . $e->getMessage(), [
        'exception_trace' => $e->getTraceAsString(),
        'data_processed' => $dataToProcess->toArray()
      ]);
      throw $e;
    }
  }

  /**
   * Process client data during finalization
   * 
   * @param array $rowFromPreview Row data from preview
   * @return Client|null Created or found Client, or null on error
   */
  private function processClientData(array $rowFromPreview): ?Client
  {
    // First try to find by ID if available
    $client = Client::find($rowFromPreview['db_client_id'] ?? null);

    // If client not found and action is to create new
    if (!$client && isset($rowFromPreview['action_client']) && $rowFromPreview['action_client'] === 'create_new') {
      try {
        $client = Client::create([
          'cif' => $rowFromPreview['client_cif'],
          'name' => $rowFromPreview['original_excel_row'][self::COL_CLIENT_NAME] ?? 'Nama Klien Default',
          'joined_at' => $this->reportDate,
        ]);
        Log::info("Finalisasi: Klien baru dibuat - CIF: {$client->cif}");
      } catch (\Exception $e) {
        Log::error("Finalisasi: Gagal membuat klien baru - " . $e->getMessage(), ['data' => $rowFromPreview]);
        return null;
      }
    } elseif (!$client) {
      Log::warning("Finalisasi: Klien tidak ditemukan untuk ID: " .
        ($rowFromPreview['db_client_id'] ?? 'N/A'), ['data' => $rowFromPreview]);
      return null;
    }

    return $client;
  }

  /**
   * Process account data during finalization
   * 
   * @param array $rowFromPreview Row data from preview
   * @param Client $client Client object
   * @param User $universalBanker Universal Banker object
   * @param array &$universalBankersAffected Reference to affected UBs array
   * @param int &$processedCount Reference to processed count
   * @return bool Whether processing was successful
   */
  private function processAccountData(
    array $rowFromPreview,
    Client $client,
    User $universalBanker,
    array &$universalBankersAffected,
    int &$processedCount
  ): bool {
    $account = Account::find($rowFromPreview['db_account_id'] ?? null);
    $currentBalanceFinal = $this->formatCurrency($rowFromPreview['editable_current_balance']);
    $availableBalanceFinal = $this->formatCurrency($rowFromPreview['editable_available_balance']);

    // Update existing account
    $previousBalanceDb = (float)$rowFromPreview['db_previous_balance'];
    $transactionAmountFinal = $currentBalanceFinal - $previousBalanceDb;

    // Only process if there's a significant balance change
    if (
      abs($transactionAmountFinal) > self::EPSILON ||
      abs((float)$account->available_balance - $availableBalanceFinal) > self::EPSILON
    ) {

      // Create transaction record if balance changed
      if (abs($transactionAmountFinal) > self::EPSILON) {
        $this->createTransactionRecord(
          $account->id,
          $transactionAmountFinal,
          $previousBalanceDb,
          $currentBalanceFinal
        );
      }

      // Update account details
      $account->current_balance = $currentBalanceFinal;
      $account->available_balance = $availableBalanceFinal;
      $account->last_transaction_at = Carbon::parse($this->reportDate)->endOfDay();
      $account->save();

      $universalBankersAffected[$universalBanker->id] = true;
      Log::info("Finalisasi: Rekening {$account->account_number} berhasil diproses dan disimpan.");
      return true;
    } else {
      Log::info("Finalisasi: Tidak ada perubahan signifikan pada saldo rekening {$account->account_number}. Tidak ada aksi dilakukan.");
      return false;
    }
  }


  /**
   * Create a transaction record
   * 
   * @param int $accountId Account ID
   * @param float $amount Transaction amount
   * @param float $previousBalance Previous balance
   * @param float $newBalance New balance
   * @return AccountTransaction
   */
  private function createTransactionRecord(
    int $accountId,
    float $amount,
    float $previousBalance,
    float $newBalance
  ): AccountTransaction {
    return AccountTransaction::create([
      'account_id' => $accountId,
      'amount' => $amount,
      'previous_balance' => $previousBalance,
      'new_balance' => $newBalance,
      'created_at' => Carbon::parse($this->reportDate)->endOfDay(),
      'updated_at' => Carbon::parse($this->reportDate)->endOfDay(),
    ]);
  }

  /**
   * Update daily balances for all affected Universal Bankers.
   *
   * @param array $universalBankersAffected
   * @return void
   */
  private function updateUniversalBankerDailyBalances(array $universalBankersAffected): void
  {
    if (empty($universalBankersAffected) || !$this->reportDate) {
      Log::info('Tidak ada UB yang terpengaruh atau tanggal laporan tidak valid untuk pembaruan saldo harian.');
      return;
    }

    $dateToUpdate = Carbon::parse($this->reportDate);

    foreach (array_keys($universalBankersAffected) as $ubId) {
      try {
        $currentTotalPortfolioBalance = (float) Account::where('universal_banker_id', $ubId)
          ->sum('current_balance');

        $previousDayDate = $dateToUpdate->copy()->subDay()->format('Y-m-d');
        $previousUbDailyBalance = UniversalBankerDailyBalance::where('universal_banker_id', $ubId)
          ->where('date', $previousDayDate)
          ->first();

        $previousTotalPortfolioBalance = $previousUbDailyBalance ? (float)$previousUbDailyBalance->total_balance : 0.0;
        $dailyChange = $currentTotalPortfolioBalance - $previousTotalPortfolioBalance;

        UniversalBankerDailyBalance::updateOrCreate(
          [
            'universal_banker_id' => $ubId,
            'date' => $dateToUpdate->format('Y-m-d')
          ],
          [
            'total_balance' => $currentTotalPortfolioBalance,
            'daily_change' => $dailyChange,
          ]
        );

        Log::info("Saldo harian UB ID {$ubId} untuk {$this->reportDate} diperbarui. Total: {$currentTotalPortfolioBalance}, Perubahan: {$dailyChange}");
      } catch (\Exception $e) {
        Log::error("Error updating daily balance for UB {$ubId}: " . $e->getMessage(), ['exception' => $e]);
        // Continue with other UBs instead of failing the entire process
      }
    }
  }

  /**
   * Save validated data after user confirmation.
   *
   * @param array $dataToSave
   * @param string $reportDate
   * @param bool $overrideExisting
   * @return array
   */
  public function saveValidatedData(array $dataToSave, string $reportDate, bool $overrideExisting = false): array
  {
    try {
      $collection = collect($dataToSave);
      $processedCount = $this->finalizeAccountData($collection, $reportDate);

      return [
        'success' => true,
        'message' => "Berhasil menyimpan {$processedCount} data Universal Banker.",
        'processed_count' => $processedCount
      ];
    } catch (\Exception $e) {
      Log::error('Error saving validated data', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return [
        'success' => false,
        'message' => 'Gagal menyimpan data: ' . $e->getMessage()
      ];
    }
  }


  /**
   * Format currency value, removing separators and handling scientific notation.
   *
   * @param mixed $value
   * @return float
   */
  private function formatCurrency($value): float
  {
    if (is_numeric($value)) {
      return (float)$value;
    }

    if (is_string($value)) {
      // Handle scientific notation
      if (stripos($value, 'E+') !== false || stripos($value, 'e+') !== false) {
        return (float)$value;
      }

      // Remove non-numeric characters except decimal point and minus sign
      $cleanedValue = preg_replace('/[^\d.-]/', '', $value);

      // Handle multiple decimal points
      if (substr_count($cleanedValue, '.') > 1) {
        $parts = explode('.', $cleanedValue);
        $integerPart = array_shift($parts);
        $cleanedValue = $integerPart . '.' . implode('', $parts);
      }

      return (float)$cleanedValue;
    }

    return 0.0;
  }
}
