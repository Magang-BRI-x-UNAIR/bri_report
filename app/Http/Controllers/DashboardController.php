<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessExcelImport;
use Illuminate\Http\Request;
use App\Services\ExcelProcessingService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

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
        return Inertia::render('Dashboard/Index');
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
     * Menyimpan data yang sudah disetujui dari preview.
     * Endpoint ini akan menjadi endpoint terpisah.
     */
    public function saveImport(Request $request)
    {
        $validatedData = $request->validate([
            'dataToSave' => 'required|array',
            'reportDate' => 'required|date_format:Y-m-d',
            'override_existing' => 'required|boolean',
        ]);

        try {
            // Panggil service untuk menyimpan data
            $result = $this->excelProcessingService->saveValidatedData(
                $validatedData['dataToSave'],
                $validatedData['reportDate'],
                $validatedData['override_existing']
            );

            if ($result['success']) {
                return redirect()->route('dashboard')->with('success', $result['message']);
            } else {
                return back()->with('error', $result['message']);
            }
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan data import', ['error' => $e->getMessage()]);
            return back()->with('error', 'Terjadi kesalahan internal saat menyimpan data.');
        }
    }
}
