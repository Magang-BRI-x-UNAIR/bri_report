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

  /**
   * Supported date formats for parsing
   */
  private const DATE_FORMATS = [
    'Y-m-d',
    'd/m/Y',
    'm/d/Y',
    'Y/m/d',
    'd-m-Y',
    'm-d-Y',
    'd-M-Y',
    'd-M-y',
    'm-d-y'
  ];

  /**
   * Excel column mappings
   */
  public const COL_REPORT_DATE = 'textbox16';
  public const COL_CLIENT_CIF = 'textbox4';
  public const COL_CLIENT_NAME = 'textbox38';
  public const COL_ACCOUNT_NUMBER = 'textbox15';
  public const COL_PN_SINGLE_PN = 'pn_singlepn';
  public const COL_BALANCE = 'balance';
  public const COL_AVAIL_BALANCE = 'availbalance';
  public const COL_ACCOUNT_PRODUCT_CODE = 'textbox11';
  public const COL_PN_RO = 'pn_relationship_officer';
  public const COL_CURRENCY = 'textbox8';

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
  public function generatePreviewData(UploadedFile $file): array
  {
    $this->reportDate = null;
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
      $excelDataCollections = Excel::toCollection(new \App\Imports\AccountDataImport, $file);

      if ($excelDataCollections->isEmpty() || $excelDataCollections->first()->isEmpty()) {
        throw new \InvalidArgumentException('File Excel kosong atau sheet pertama tidak mengandung data.');
      }

      $excelDataRows = $excelDataCollections->first();
      $this->parseReportDate($excelDataRows->first()->toArray());
      $summary['total_rows_in_excel'] = $excelDataRows->count();

      foreach ($excelDataRows as $index => $rowObject) {
        $rowNumber = $index + 2;
        $row = $rowObject->toArray();
        $rowDataForPreview = $row;

        // Validate the row data
        $validator = new ExcelRowValidator($row);
        if (!$validator->isValid()) {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'errors' => $validator->getErrors(),
            'data' => $row
          ];
          $summary['skipped_rows']++;
          continue;
        }

        $validatedData = $validator->getValidatedData();

        // Check for empty or invalid PN_RO
        $pnRoValue = $validatedData[self::COL_PN_RO] ?? '';
        if (empty($pnRoValue) || trim($pnRoValue) === '-') {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'error' => "PN Relationship Officer kosong atau tidak valid.",
            'data' => $row
          ];
          $summary['skipped_rows']++;
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
          continue;
        } else {
          $rowDataForPreview['status_client'] = 'found';
          $rowDataForPreview['db_client_id'] = $client->id;
          $rowDataForPreview['db_client_name'] = $client->name;
        }

        // Find the Account Product
        $accountProductCode = $validatedData[self::COL_ACCOUNT_PRODUCT_CODE] ?? '';
        $accountProduct = $this->findAccountProduct($accountProductCode);

        if (!$accountProduct) {
          $processingErrors[] = [
            'row_number' => $rowNumber,
            'error' => "Produk Akun dengan kode '{$accountProductCode}' tidak ditemukan.",
            'data' => $row
          ];
          $summary['skipped_rows']++;
          continue;
        }

        $rowDataForPreview['db_account_product_id'] = $accountProduct->id;
        $rowDataForPreview['db_account_product_name'] = $accountProduct->name;

        // Find or prepare new account
        $accountNumber = $validatedData[self::COL_ACCOUNT_NUMBER] ?? '';
        $account = $this->findAccount($accountNumber, $client->id);

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

  /**
   * Parse and set the report date from the Excel data
   *
   * @param array $headerRow The first row of Excel data
   * @return void
   */
  private function parseReportDate(array $headerRow): void
  {
    $reportDateRaw = $headerRow[self::COL_REPORT_DATE] ?? null;

    if (!$reportDateRaw) {
      Log::warning("Tanggal laporan tidak ditemukan dalam data Excel.");
      $this->reportDate = Carbon::today()->format('Y-m-d');
      return;
    }

    foreach (self::DATE_FORMATS as $format) {
      try {
        $date = Carbon::createFromFormat($format, $reportDateRaw);
        if ($date) {
          $this->reportDate = $date->format('Y-m-d');
          return;
        }
      } catch (\Exception $e) {
        continue;
      }
    }

    // Fallback to current date if parsing fails
    Log::warning("Format tanggal laporan tidak valid: {$reportDateRaw}. Menggunakan tanggal hari ini.");
    $this->reportDate = Carbon::today()->format('Y-m-d');
  }

  /**
   * Find Universal Banker by their code (NIP) from PN_RO field
   *
   * @param string $pnRoExcel
   * @return User|null
   */
  private function findUniversalBanker(string $pnRoExcel): ?User
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
  private function findClient(string $cif): ?Client
  {
    if (empty($cif)) {
      return null;
    }

    return Client::where('cif', $cif)->first();
  }

  /**
   * Find account product by code
   * 
   * @param string $code
   * @return AccountProduct|null
   */
  private function findAccountProduct(string $code): ?AccountProduct
  {
    if (empty($code)) {
      return null;
    }

    return AccountProduct::where('code', $code)->first();
  }

  /**
   * Find account by account number and client ID
   * 
   * @param string $accountNumber
   * @param int $clientId
   * @return Account|null
   */
  private function findAccount(string $accountNumber, int $clientId): ?Account
  {
    if (empty($accountNumber)) {
      return null;
    }

    return Account::where('account_number', $accountNumber)
      ->where('client_id', $clientId)
      ->first();
  }

  /**
   * Prepare preview data for a new account
   * 
   * @param array &$rowDataForPreview Reference to row data array
   * @param float $currentBalanceFromExcel Current balance from Excel
   * @return void
   */
  private function prepareNewAccountPreview(array &$rowDataForPreview, float $currentBalanceFromExcel): void
  {
    $rowDataForPreview['status_account'] = 'not_found';
    $rowDataForPreview['db_previous_balance'] = 0; // Saldo awal 0
    $rowDataForPreview['calculated_transaction_amount'] = $currentBalanceFromExcel; // Setoran awal
    $rowDataForPreview['action_description'] = "Buat Rekening Baru dengan saldo " . number_format($currentBalanceFromExcel, 2);
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

    // Handle new account creation
    if (!$account && isset($rowFromPreview['action_account']) && $rowFromPreview['action_account'] === 'create_new') {
      if (!$this->createNewAccount(
        $rowFromPreview,
        $client,
        $universalBanker,
        $currentBalanceFinal,
        $availableBalanceFinal,
        $universalBankersAffected
      )) {
        return false;
      }
      return true;
    }
    // Handle account not found
    elseif (!$account) {
      Log::warning("Finalisasi: Rekening tidak ditemukan untuk ID: " .
        ($rowFromPreview['db_account_id'] ?? 'N/A'), ['data' => $rowFromPreview]);
      return false;
    }

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
   * Create a new account during finalization
   * 
   * @param array $rowFromPreview Row data from preview
   * @param Client $client Client object
   * @param User $universalBanker Universal Banker object
   * @param float $currentBalanceFinal Final current balance
   * @param float $availableBalanceFinal Final available balance
   * @param array &$universalBankersAffected Reference to affected UBs array
   * @return bool Whether creation was successful
   */
  private function createNewAccount(
    array $rowFromPreview,
    Client $client,
    User $universalBanker,
    float $currentBalanceFinal,
    float $availableBalanceFinal,
    array &$universalBankersAffected
  ): bool {
    try {
      $accountProduct = AccountProduct::find($rowFromPreview['db_account_product_id']);
      if (!$accountProduct) {
        Log::warning("Finalisasi: Produk Akun tidak ditemukan untuk ID: " .
          ($rowFromPreview['db_account_product_id'] ?? 'N/A'), ['data' => $rowFromPreview]);
        return false;
      }

      $account = Account::create([
        'client_id' => $client->id,
        'account_product_id' => $accountProduct->id,
        'universal_banker_id' => $universalBanker->id,
        'account_number' => $rowFromPreview['account_number'],
        'current_balance' => $currentBalanceFinal,
        'available_balance' => $availableBalanceFinal,
        'currency' => $rowFromPreview['original_excel_row'][self::COL_CURRENCY] ?? 'IDR',
        'status' => 'active',
        'opened_at' => $this->reportDate,
        'last_transaction_at' => $this->reportDate,
      ]);

      // Create initial deposit transaction
      $this->createTransactionRecord(
        $account->id,
        $currentBalanceFinal,
        0,
        $currentBalanceFinal
      );

      $universalBankersAffected[$universalBanker->id] = true;
      Log::info("Finalisasi: Rekening baru dibuat - No: {$account->account_number}");
      return true;
    } catch (\Exception $e) {
      Log::error("Finalisasi: Gagal membuat rekening baru - " . $e->getMessage(), [
        'exception' => $e,
        'data' => $rowFromPreview
      ]);
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
