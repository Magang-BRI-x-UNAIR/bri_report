<?php

namespace App\Jobs;

use App\Exports\UniversalBankerExport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ProcessExcelExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $universalBankerIds;
    protected string $startDate;
    protected string $endDate;
    protected int $baselineYear;
    protected string $cacheKey;

    public function __construct(array $universalBankerIds, string $startDate, string $endDate, int $baselineYear, string $cacheKey)
    {
        $this->universalBankerIds = $universalBankerIds;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->baselineYear = $baselineYear;
        $this->cacheKey = $cacheKey;
    }

    public function handle(): void
    {
        try {
            Cache::put($this->cacheKey, ['status' => 'processing', 'message' => 'Mengumpulkan dan memformat data...'], now()->addHour());
            Log::info("Memulai job ProcessExcelExport untuk cache key: {$this->cacheKey}");

            $fileName = 'reports/Laporan_Kinerja_UB_' . $this->cacheKey . '.xlsx';

            Excel::store(
                new UniversalBankerExport($this->universalBankerIds, $this->startDate, $this->endDate, $this->baselineYear),
                $fileName,
                'local'
            );

            if (Storage::disk('local')->exists($fileName)) {
                Cache::put($this->cacheKey, [
                    'status' => 'completed',
                    'message' => 'File laporan berhasil dibuat dan siap diunduh.',
                    'file_path' => $fileName,
                    'file_name' => 'Laporan Kinerja UB - ' . now()->format('d-M-Y') . '.xlsx',
                ], now()->addHour());
                Log::info("Job ProcessExcelExport berhasil untuk cache key: {$this->cacheKey}. File: {$fileName}");
            } else {
                throw new \Exception("File Excel gagal dibuat atau tidak ditemukan di storage.");
            }
        } catch (\Exception $e) {
            Log::error('Job ProcessExcelExport Gagal', ['cacheKey' => $this->cacheKey, 'error' => $e->getMessage()]);
            Cache::put($this->cacheKey, ['status' => 'failed', 'message' => $e->getMessage()], now()->addHour());
        }
    }
}
