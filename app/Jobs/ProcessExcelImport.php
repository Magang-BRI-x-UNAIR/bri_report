<?php

namespace App\Jobs;

use App\Imports\UniversalBankerImport; // Import class Importer
use App\Services\ExcelProcessingService; // Import Service
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class ProcessExcelImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;
    protected string $reportDate;
    protected string $cacheKey;

    public function __construct(string $filePath, string $reportDate, string $cacheKey)
    {
        $this->filePath = $filePath;
        $this->reportDate = $reportDate;
        $this->cacheKey = $cacheKey;
    }

    /**
     * Jalankan job di background.
     */
    public function handle(): void
    {
        try {
            // Set status awal
            Cache::put($this->cacheKey, ['status' => 'processing', 'data' => null], now()->addHour());

            $processingService = new ExcelProcessingService();
            $importer = new UniversalBankerImport($processingService, $this->reportDate);

            Excel::import($importer, $this->filePath);

            $previewData = $importer->getPreviewData();

            // Simpan hasil ke Cache
            Cache::put($this->cacheKey, ['status' => 'completed', 'data' => $previewData], now()->addHour());
        } catch (\Exception $e) {
            Log::error('Job ProcessExcelImport Gagal', ['cacheKey' => $this->cacheKey, 'error' => $e->getMessage()]);
            Cache::put($this->cacheKey, ['status' => 'failed', 'message' => $e->getMessage()], now()->addHour());
        }
    }
}
