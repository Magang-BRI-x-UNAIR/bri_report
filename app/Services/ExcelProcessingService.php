<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Client;
use App\Models\AccountTransaction;
use App\Models\User;
use App\Models\UniversalBankerDailyBalance;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


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
      if (empty($officerCode)) {
        Log::warning("Empty officer code after parsing '{$pnRoExcel}'");
        return null;
      }
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
   * Menyimpan data yang sudah divalidasi dan dikonfirmasi oleh pengguna.
   * Method ini sekarang dipanggil dari dalam Job.
   *
   * @param array $dataToSave Data valid dari frontend.
   * @param string $reportDate Tanggal laporan dalam format 'Y-m-d'.
   * @return array Hasil proses ['success' => bool, 'message' => string, 'processed_count' => int]
   * @throws \Exception
   */
  public function saveValidatedData(array $dataToSave, string $reportDate): array
  {
    $this->reportDate = $reportDate;
    $processedCount = 0;
    $skippedCount = 0;

    $ubBalanceAggregates = [];

    DB::beginTransaction();

    try {
      foreach ($dataToSave as $row) {
        $account = $this->findAccount($row['account_number']);
        if (!$account) {
          Log::warning("Finalisasi Gagal: Akun dengan ID {$row['account_number']} tidak ditemukan.", ['data' => $row]);
          continue;
        }

        $ubId = $account->universal_banker_id;
        $currentBalanceFromExcel = (float) $row['current_balance'];

        if (!isset($ubBalanceAggregates[$ubId])) {
          $ubBalanceAggregates[$ubId] = [
            'total_balance_from_excel' => 0.0,
          ];
        }

        $ubBalanceAggregates[$ubId]['total_balance_from_excel'] += $currentBalanceFromExcel;

        $reportDateCarbon = Carbon::parse($this->reportDate)->endOfDay();
        $lastUpdateDate = $account->last_transaction_at;
        $previousBalanceFromDb = (float) $account->current_balance;
        $balanceChange = $currentBalanceFromExcel - $previousBalanceFromDb;
        if (!$lastUpdateDate || $reportDateCarbon->gt($lastUpdateDate)) {

          $previousBalanceFromDb = (float) $account->current_balance;
          $balanceChange = $currentBalanceFromExcel - $previousBalanceFromDb;
          if (abs($balanceChange) > self::EPSILON) {
            AccountTransaction::create([
              'account_id' => $account->id,
              'amount' => $balanceChange,
              'previous_balance' => $previousBalanceFromDb,
              'new_balance' => $currentBalanceFromExcel,
              'created_at' => $reportDateCarbon,
              'updated_at' => $reportDateCarbon,
            ]);

            $account->current_balance = $currentBalanceFromExcel;
            $account->available_balance = (float) $row['available_balance'];
            $account->last_transaction_at = $reportDateCarbon;
            $account->save();

            $processedCount++;
          }
        } else {
          $skippedCount++;
          Log::info("UPDATE DILEWATI: Data untuk akun {$account->account_number} tanggal {$this->reportDate} lebih lama dari data yang ada di database ({$lastUpdateDate->toDateString()}).");
        }
      }

      if (!empty($ubBalanceAggregates)) {
        $this->updateUniversalBankerDailyBalances($ubBalanceAggregates);
      }
      DB::commit();

      $message = "Berhasil memproses {$processedCount} perubahan data rekening.";
      if ($skippedCount > 0) {
        $message .= " {$skippedCount} baris dilewati karena data sudah lebih baru di sistem.";
      }

      return [
        'success' => true,
        'message' => $message,
        'processed_count' => $processedCount
      ];
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Gagal menyimpan data import: Transaksi dibatalkan.', ['error' => $e->getMessage()]);
      throw new \Exception('Gagal menyimpan data karena terjadi kesalahan internal.');
    }
  }

  /**
   * Mengupdate saldo harian untuk semua UB yang terpengaruh.
   * Logika disederhanakan: HANYA menyimpan total_balance.
   *
   * @param array $ubBalanceAggregates Data agregat berisi total saldo per UB.
   * @return void
   */
  private function updateUniversalBankerDailyBalances(array $ubBalanceAggregates): void
  {
    if (empty($ubBalanceAggregates) || !$this->reportDate) {
      return;
    }

    $dateToUpdate = Carbon::parse($this->reportDate);

    foreach ($ubBalanceAggregates as $ubId => $aggregates) {
      try {
        $currentTotalPortfolioBalance = $aggregates['total_balance_from_excel'];

        UniversalBankerDailyBalance::updateOrCreate(
          [
            'universal_banker_id' => $ubId,
            'date' => $dateToUpdate->format('Y-m-d')
          ],
          [
            'total_balance' => $currentTotalPortfolioBalance,
          ]
        );

        Log::info("Saldo harian UB ID {$ubId} untuk {$this->reportDate} berhasil diperbarui dengan total saldo: {$currentTotalPortfolioBalance}");
      } catch (\Exception $e) {
        Log::error("Gagal mengupdate saldo harian untuk UB ID {$ubId}: " . $e->getMessage(), ['exception' => $e]);
      }
    }
  }
}
