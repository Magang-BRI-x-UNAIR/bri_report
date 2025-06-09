<?php

namespace App\Jobs;

use App\Services\ExcelProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FinalizeExcelImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $dataToSave;
    protected string $reportDate;
    protected ?string $userId;
    protected string $resultCacheKey; // Key untuk menyimpan hasil akhir

    /**
     * Buat instance job baru.
     */
    public function __construct(array $dataToSave, string $reportDate, ?string $userId, string $resultCacheKey)
    {
        $this->dataToSave = $dataToSave;
        $this->reportDate = $reportDate;
        $this->userId = $userId;
        $this->resultCacheKey = $resultCacheKey;
    }

    /**
     * Jalankan job.
     */
    public function handle(ExcelProcessingService $processingService): void
    {
        // Set status awal -> proses penyimpanan sedang berjalan
        Cache::put($this->resultCacheKey, ['status' => 'saving', 'message' => 'Menyimpan data ke database...'], now()->addHour());
        Log::info("Memulai job FinalizeExcelImport untuk cache key: {$this->resultCacheKey}");

        try {
            $result = $processingService->saveValidatedData(
                $this->dataToSave,
                $this->reportDate
            );

            if ($result['success']) {
                Cache::put($this->resultCacheKey, [
                    'status' => 'completed',
                    'message' => $result['message'],
                    'processed_count' => $result['processed_count']
                ], now()->addHour());
                Log::info("Job FinalizeExcelImport berhasil untuk cache key: {$this->resultCacheKey}");
            } else {
                throw new \Exception($result['message']);
            }
        } catch (\Exception $e) {
            Log::error("Job FinalizeExcelImport Gagal untuk cache key: {$this->resultCacheKey}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            Cache::put($this->resultCacheKey, ['status' => 'failed', 'message' => 'Terjadi kesalahan saat menyimpan: ' . $e->getMessage()], now()->addHour());
        }
    }
}
