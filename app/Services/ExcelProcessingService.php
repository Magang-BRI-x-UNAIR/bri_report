<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Client;
use App\Models\AccountTransaction;
use App\Models\User;
use App\Models\UniversalBankerDailyBalance;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
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
   * Find Universal Banker by their code (NIP) from PN_RO field
   *
   * @param string $pnRoExcel
   * @return User|null
   */
  public function findUniversalBanker(string $pnRoExcel): ?User
  {
    try {
      $officerInfo = explode('-', $pnRoExcel);
      $officerCode = trim($officerInfo[0]);

      // Check for empty officer code after parsing
      if (empty($officerCode)) {
        Log::warning("Empty officer code after parsing '{$pnRoExcel}'");
        return null;
      }
      // Find Universal Banker with the given NIP
      $universalBanker = User::where('nip', $officerCode)
        ->role('universal_banker')
        ->first();

      if (!$universalBanker) {
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
