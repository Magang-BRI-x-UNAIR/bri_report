<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Inertia\Inertia;
use App\Services\UserService;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * UserService instance.
     *
     * @var UserService
     */
    protected UserService $userService;


    /**
     * Create a new controller instance.
     *
     * @param UserService $userService
     * @return void
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Dashboard/UniversalBankers/Index', [
            'universalBankers' => $this->userService->getAllUniversalBankers(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dashboard/UniversalBankers/Create', [
            'branches' => $this->userService->getAllBranches(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $validatedData = $request->validated();

        try {
            $this->userService->createUniversalBanker($validatedData);
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
    public function show(User $universalBanker)
    {
        $details = $this->userService->getUniversalBankerDetails($universalBanker);

        return Inertia::render('Dashboard/UniversalBankers/Show', $details);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $universalBanker)
    {
        $universalBanker->load('branch');

        return Inertia::render('Dashboard/UniversalBankers/Edit', [
            'user' => $universalBanker,
            'branches' => $this->userService->getAllBranches(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $universalBanker)
    {
        $validatedData = $request->validated();

        try {
            $this->userService->updateUniversalBanker($universalBanker, $validatedData);

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
    public function destroy(User $universalBanker)
    {
        try {
            $this->userService->deleteUniversalBanker($universalBanker);

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
