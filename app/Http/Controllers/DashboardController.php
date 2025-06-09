<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\FinalizeExcelImport;
use App\Jobs\ProcessExcelImport;
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
    public function process(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:20480',
            'report_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $path = $request->file('file')->store('imports');

            $cacheKey = 'import_preview_' . Str::uuid();

            ProcessExcelImport::dispatch(
                $path,
                $request->input('report_date'),
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
    public function resultPage($result_id)
    {
        return Inertia::render('Dashboard/Import/Result', [
            'resultId' => $result_id
        ]);
    }

    /**
     * API endpoint untuk mengecek status job penyimpanan.
     */
    public function getSaveStatus($result_id)
    {
        return response()->json(Cache::get($result_id));
    }
}
