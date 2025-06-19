<?php

namespace App\Http\Controllers;

use App\Models\UniversalBanker;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUniversalBankerRequest;
use App\Http\Requests\UpdateUniversalBankerRequest;
use Inertia\Inertia;
use App\Services\UniversalBankerService;
use Illuminate\Support\Facades\Log;

class UniversalBankerController extends Controller
{
    /**
     * UniversalBankerService instance.
     *
     * @var UniversalBankerService
     */
    protected UniversalBankerService $universalBankerService;


    /**
     * Create a new controller instance.
     *
     * @param UniversalBankerService $universalBankerService
     * @return void
     */
    public function __construct(UniversalBankerService $universalBankerService)
    {
        $this->universalBankerService = $universalBankerService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Dashboard/UniversalBankers/Index', [
            'universalBankers' => $this->universalBankerService->getAllUniversalBankers(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/UniversalBankers/Create', [
            'branches' => $this->universalBankerService->getAllBranches(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUniversalBankerRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $this->universalBankerService->createUniversalBanker($validatedData);
            return redirect()->route('universalBankers.index')
                ->with('success', 'Universal Banker created successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to create Universal Banker', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                ->with('error', 'Failed to create Universal Banker: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(UniversalBanker $universalBanker)
    {
        $details = $this->universalBankerService->getUniversalBankerDetails($universalBanker);

        return Inertia::render('Dashboard/UniversalBankers/Show', $details);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UniversalBanker $universalBanker)
    {
        $universalBanker->load('branch');

        return Inertia::render('Dashboard/UniversalBankers/Edit', [
            'universalBanker' => $universalBanker,
            'branches' => $this->universalBankerService->getAllBranches(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUniversalBankerRequest $request, UniversalBanker $universalBanker)
    {
        $validatedData = $request->validated();

        try {
            $this->universalBankerService->updateUniversalBanker($universalBanker, $validatedData);

            return redirect()->route('universalBankers.index')
                ->with('success', 'Universal Banker updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update Universal Banker', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to update Universal Banker: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UniversalBanker $universalBanker)
    {
        try {
            $this->universalBankerService->deleteUniversalBanker($universalBanker);

            return redirect()->route('universalBankers.index')
                ->with('success', 'Universal Banker deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete Universal Banker', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to delete Universal Banker: ' . $e->getMessage());
        }
    }
}
