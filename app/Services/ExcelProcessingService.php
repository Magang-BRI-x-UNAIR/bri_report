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
