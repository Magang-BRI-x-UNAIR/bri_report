<?php

namespace App\Imports;

use App\Services\ExcelProcessingService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;

class UniversalBankerImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    // Kebutuhan data dari luar
    private ExcelProcessingService $processingService;
    private string $reportDate;

    // Tempat menyimpan hasil
    private array $validRows = [];
    private array $errors = [];
    private array $summary = [
        'total_rows_in_excel' => 0,
        'valid_rows' => 0,
        'skipped_rows' => 0,
    ];
    private array $universalBankersAffected = [];
    public const COL_CLIENT_CIF = 'ciff_no';
    public const COL_CLIENT_NAME = 'short_name';
    public const COL_ACCOUNT_NUMBER = 'account_number';
    public const COL_PN_RELATIONSHIP_OFFICER = 'pn_relationship_officer';
    public const COL_BALANCE = 'balance';
    public const COL_AVAIL_BALANCE = 'available_balance';

    public function __construct(
        ExcelProcessingService $processingService,
        string $reportDate
    ) {
        $this->processingService = $processingService;
        $this->reportDate = $reportDate;
    }

    private function formatCurrencyValue($value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }
        if (is_numeric($value)) {
            return round((float)$value, 3);
        }
        if (is_string($value)) {
            $value = preg_replace('/\s+/', '', $value);
            $value = str_replace(',', '', $value);
            if (strpos($value, '.') !== false) {
            } else if (strpos($value, ',') !== false) {
                $value = str_replace(',', '.', $value);
            }
            $value = preg_replace('/[^0-9.-]/', '', $value);
        }
        return is_numeric($value) ? round((float)$value, 3) : 0.0;
    }
    public function collection(Collection $rows)
    {
        $this->summary['total_rows_in_excel'] += $rows->count();

        foreach ($rows as $index => $row) {
            $rowNumber = ($this->summary['total_rows_in_excel'] - $rows->count()) + $index + 2; // +2 for 1-indexing and header


            $pnRoValue = $row[self::COL_PN_RELATIONSHIP_OFFICER];

            $universalBanker = $this->processingService->findUniversalBanker($pnRoValue);

            if (!$universalBanker) {
                $this->errors[] = [
                    'row_number' => $rowNumber,
                    'errors' => ["UB tidak ditemukan untuk kode: {$pnRoValue}"],
                ];
                $this->summary['skipped_rows']++;
                continue;
            }

            // Proses account number
            $accountNumber = $row[self::COL_ACCOUNT_NUMBER];
            $account = $this->processingService->findAccount($accountNumber);
            if (!$account) {
                $this->errors[] = [
                    'row_number' => $rowNumber,
                    'errors' => ["Akun dengan nomor '{$accountNumber}' tidak ditemukan."],
                ];
                $this->summary['skipped_rows']++;
                continue;
            }

            // Proses client (nasabah)
            $clientCif = $row[self::COL_CLIENT_CIF];
            $client = $this->processingService->findClient($clientCif);

            if (!$client) {
                $this->errors[] = [
                    'row_number' => $rowNumber,
                    'errors' => ["Klien dengan CIF '{$clientCif}' tidak ditemukan."],
                ];
                $this->summary['skipped_rows']++;
                continue;
            }
            $previousBalance = $this->formatCurrencyValue($account->current_balance);
            $currentBalance = $this->formatCurrencyValue($row[self::COL_BALANCE]);
            $availableBalance = $this->formatCurrencyValue($row[self::COL_AVAIL_BALANCE]);
            $previousAvailableBalance = $this->formatCurrencyValue($account->available_balance);

            $rowDataForPreview = [
                'cif' => $clientCif,
                'client_name' => $row[self::COL_CLIENT_NAME],
                'account_number' => $accountNumber,
                'previous_balance' => $previousBalance,
                'current_balance' => $currentBalance,
                'available_balance' => $availableBalance,
                'previous_available_balance' => $previousAvailableBalance,
                'db_account_id' => $account->id,
                'db_client_id' => $client->id,
                'db_universal_banker_id' => $universalBanker->id,
                'universal_banker_name' => $universalBanker->name,
            ];

            $balanceChange = $currentBalance - $previousBalance;
            $rowDataForPreview['balance_change'] = $balanceChange;

            if (abs($previousBalance) > 0.001) {
                $changePercent = ($balanceChange / $previousBalance) * 100;
                $rowDataForPreview['change_percent'] = round($changePercent, 2);
            } else {
                $rowDataForPreview['change_percent'] = 0;
            }

            $this->validRows[] = $rowDataForPreview;
            $this->universalBankersAffected[$universalBanker->id] = true;

            $this->summary['valid_rows']++;
        }
    }

    public function getPreviewData(): array
    {
        return [
            'valid_rows' => $this->validRows,
            'errors' => $this->errors,
            'summary' => $this->summary,
            'report_date' => $this->reportDate,
            'universal_bankers_to_update_ids' => array_keys($this->universalBankersAffected),
        ];
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
