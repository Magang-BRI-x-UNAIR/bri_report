<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\FinalizeExcelImport;
use App\Jobs\ProcessExcelImport;
use App\Jobs\ProcessExcelExport;
use Illuminate\Http\Request;
use App\Services\ExcelProcessingService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Client;
use App\Models\Account;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    //
    /**
     * ExcelProcessingService instance.
     *
     * @var ExcelProcessingService
     */
    protected ExcelProcessingService $excelProcessingService;


    /**
     * Create a new controller instance.
     *
     * @param ExcelProcessingService $excelProcessingService
     * @return void
     */
    public function __construct(ExcelProcessingService $excelProcessingService)
    {
        $this->excelProcessingService = $excelProcessingService;
    }

    /**
     * Menampilkan halaman dashboard utama.
     */
    public function index()
    {
        // Kalkulasi data statistik
        $stats = [
            'totalUniversalBankers' => User::role('universal_banker')->count(),
            'totalClients' => Client::whereHas('accounts')->distinct()->count(), // Hitung nasabah yang punya rekening
            'totalActiveAccounts' => Account::where('status', 'active')->count(),
            'totalPortfolio' => Account::sum('current_balance'),
        ];

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
        ]);
    }


    /**
     * Import universal bankers from an Excel file.
     */
    public function import()
    {
        return Inertia::render('Dashboard/Import/Index');
    }

    /**
     * Memproses file yang diunggah dan mengembalikan data untuk preview.
     * Endpoint ini dipanggil via AJAX/Fetch dari frontend.
     */
    public function processImport(Request $request)
    {
        $validatedData = $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:20480',
            'report_date' => 'required|date',
        ]);

        try {
            $path = $validatedData['file']->store('imports');

            $cacheKey = 'import_preview_' . Str::uuid();

            ProcessExcelImport::dispatch(
                $path,
                $validatedData['report_date'],
                $cacheKey
            );

            return Inertia::location(route('dashboard.import.preview', ['batch_id' => $cacheKey]));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim job import', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal memulai proses import.');
        }
    }

    /**
     * Menampilkan halaman frontend untuk preview/polling.
     */
    public function previewPage($batch_id)
    {
        // Kita hanya perlu mengirim `batchId` ke frontend.
        return Inertia::render('Dashboard/Import/Preview', [
            'batchId' => $batch_id,
        ]);
    }

    /**
     * API endpoint untuk mengecek status job.
     */
    public function getImportStatus($batch_id)
    {
        $result = Cache::get($batch_id);

        if (!$result) {
            return response()->json(['status' => 'not_found'], 404);
        }

        // Kembalikan hasilnya sebagai JSON
        return response()->json($result);
    }

    /**
     * Menerima konfirmasi dari user dan mengirimkan job penyimpanan ke queue.
     */
    public function save(Request $request)
    {
        $validated = $request->validate([
            'dataToSave' => 'required|string|json',
            'reportDate' => 'required|date',
            'batchId' => 'required|string',
        ]);

        try {
            $saveResultCacheKey = 'save_result_' . Str::uuid();

            $dataArray = json_decode($validated['dataToSave'], true);

            FinalizeExcelImport::dispatch(
                $dataArray,
                $validated['reportDate'],
                Auth::id(),
                $saveResultCacheKey
            );

            return Inertia::location(route('dashboard.import.result', ['result_id' => $saveResultCacheKey]));
        } catch (\Exception $e) {
            Log::error('Gagal mengirim job penyimpanan', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal memulai proses penyimpanan data.');
        }
    }

    /**
     * Halaman untuk menampilkan status/hasil penyimpanan.
     */
    public function importResultPage($result_id)
    {
        return Inertia::render('Dashboard/Import/Result', [
            'resultId' => $result_id
        ]);
    }


    /**
     * Menampilkan halaman untuk ekspor data.
     */
    public function export()
    {
        $universalBankers = User::role('universal_banker')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Dashboard/Export/Index', [
            'universalBankers' => $universalBankers,
        ]);
    }

    /**
     * Memproses permintaan ekspor data.
     */
    public function processExport(Request $request)
    {
        $validatedData = $request->validate([
            'universal_bankers' => 'required|array',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'baseline_year' => 'required|integer|min:2000|max:2100',
        ]);

        try {
            $cacheKey = 'export_result_' . Str::uuid();

            Cache::put($cacheKey, [
                'status' => 'processing',
                'message' => 'Permintaan export diterima dan sedang disiapkan...'
            ], now()->addHour());

            ProcessExcelExport::dispatch(
                $validatedData['universal_bankers'],
                $validatedData['start_date'],
                $validatedData['end_date'],
                $validatedData['baseline_year'],
                $cacheKey
            );

            return Inertia::location(route('dashboard.export.result', [
                'result_id' => $cacheKey
            ]));
        } catch (\Exception $e) {
            Log::error('Gagal memproses ekspor', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal memproses ekspor data.');
        }
    }

    /**
     * Halaman untuk menampilkan hasil ekspor.
     */
    public function exportResultPage($result_id)
    {
        return Inertia::render('Dashboard/Export/Result', [
            'resultId' => $result_id
        ]);
    }

    public function downloadExportedFile(string $result_id)
    {
        $cachedData = Cache::get($result_id);

        if (!$cachedData || !isset($cachedData['file_path'])) {
            return redirect()->route('dashboard.export.page')->with('error', 'Sesi unduhan tidak valid atau telah kedaluwarsa.');
        }

        $filePath = $cachedData['file_path'];
        $fileName = $cachedData['file_name'] ?? 'Laporan_Kinerja.xlsx';

        if (!str_starts_with($filePath, 'reports/')) {
            abort(403, 'Akses tidak diizinkan.');
        }

        if (Storage::disk('local')->exists($filePath)) {
            Cache::forget($result_id);
            return Storage::download($filePath, $fileName);
        }

        return redirect()->route('dashboard.export.page')->with('error', 'File tidak ditemukan atau telah dihapus dari server.');
    }

    /**
     * API endpoint untuk mengecek status ekspor.
     */
    public function getExportStatus($result_id)
    {

        return response()->json(Cache::get($result_id));
    }

    /**
     * API endpoint untuk mengecek status job penyimpanan.
     */
    public function getSaveStatus($result_id)
    {
        return response()->json(Cache::get($result_id));
    }
}
