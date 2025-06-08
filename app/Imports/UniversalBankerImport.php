<?php

namespace App\Imports;

use App\Services\ExcelProcessingService; // Asumsi service Anda di sini
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

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
        'potential_accounts_to_update' => 0,
        'potential_new_transactions' => 0,
        'skipped_rows' => 0,
    ];
    private array $universalBankersAffected = [];

    // Definisikan konstanta kolom di sini agar mudah diakses
    public const COL_CLIENT_CIF = 'textbox4';
    public const COL_CLIENT_NAME = 'textbox38';
    // ... konstanta lainnya ...
    public const COL_PN_RELATIONSHIP_OFFICER = 'pn_relationship_officer';
    public const COL_ACCOUNT_NUMBER = 'textbox15';
    public const COL_BALANCE = 'balance';
    public const COL_AVAIL_BALANCE = 'availbalance';


    public function __construct(ExcelProcessingService $processingService, string $reportDate)
    {
        $this->processingService = $processingService;
        $this->reportDate = $reportDate;
    }

    public function collection(Collection $rows)
    {
        // Setiap kali chunk diproses, tambahkan jumlah baris ke total
        $this->summary['total_rows_in_excel'] += $rows->count();

        foreach ($rows as $index => $row) {
            // Nomor baris sebenarnya (asumsi heading row ada di baris 1)
            // Ini perlu disesuaikan jika file Anda memiliki baris kosong di atas
            $rowNumber = ($this->summary['total_rows_in_excel'] - $rows->count()) + $index + 2;

            // --- Mulai pindahkan logika dari parseAndValidateFile ke sini ---

            // 1. Filter awal: Hanya proses jika PN RO valid
            $pnRoValue = $row[self::COL_PN_RELATIONSHIP_OFFICER] ?? null;
            if (empty($pnRoValue) || trim($pnRoValue) === '-') {
                $this->summary['skipped_rows']++;
                continue; // Langsung lewati baris ini
            }

            // 2. Lakukan validasi lain (jika ada)
            // Anda bisa memanggil validator Anda di sini jika diperlukan
            // Untuk contoh ini, kita lanjutkan dengan pengecekan lain

            // 3. Temukan Universal Banker
            $universalBanker = $this->processingService->findUniversalBanker($pnRoValue);
            if (!$universalBanker) {
                $this->errors[] = ['row_number' => $rowNumber, 'error' => "UB tidak ditemukan untuk kode: {$pnRoValue}", 'data' => $row];
                $this->summary['skipped_rows']++;
                continue;
            }

            $accountNumber = $row[self::COL_ACCOUNT_NUMBER] ?? null;
            $account = $this->processingService->findAccount($accountNumber);


            // 4. Temukan Client, dll.
            $clientCif = $row[self::COL_CLIENT_CIF] ?? '';
            $client = $this->processingService->findClient($clientCif);
            if (!$client) {
                $this->errors[] = ['row_number' => $rowNumber, 'error' => "Klien dengan CIF '{$clientCif}' tidak ditemukan.", 'data' => $row];
                $this->summary['skipped_rows']++;
                continue;
            }

            // 5. Jika semua valid, siapkan data untuk preview
            $rowDataForPreview = [
                // Petakan data mentah ke nama kolom yang lebih bersih
                'cif' => $row[self::COL_CLIENT_CIF] ?? null,
                'name' => $row[self::COL_CLIENT_NAME] ?? null,
                'previous_balance' => $account ? $account->current_balance : 0,
                'current_balance' => $row[self::COL_BALANCE] ?? 0,
                'db_client_id' => $client->id,
                'db_universal_banker_id' => $universalBanker->id,
                // ... data preview lainnya ...
            ];

            $this->validRows[] = $rowDataForPreview;
            $this->universalBankersAffected[$universalBanker->id] = true;
        }
    }

    /**
     * Tentukan ukuran setiap chunk.
     */
    public function chunkSize(): int
    {
        return 1000;
    }

    /**
     * Metode helper untuk mengambil semua data hasil proses.
     */
    public function getPreviewData(): array
    {
        return [
            'report_date' => $this->reportDate,
            'valid_rows' => $this->validRows,
            'summary' => $this->summary,
            'errors' => $this->errors,
            'universal_bankers_to_update_ids' => array_keys($this->universalBankersAffected)
        ];
    }
}
