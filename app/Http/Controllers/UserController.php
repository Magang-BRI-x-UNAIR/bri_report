<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Branch;
use Inertia\Inertia;
use App\Models\UniversalBankerDailyBalance;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('Dashboard/UniversalBankers/Index', [
            'universalBankers' => User::role('universal_banker')->with(['branch'])->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Dashboard/UniversalBankers/Create', [
            'branches' => Branch::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        //
        $validatedData = $request->validated();
        try {
            $validatedData['password'] = bcrypt($validatedData['password']);
            $user = User::create($validatedData);
            $user->assignRole('universal_banker');
            return redirect()->route('universalBankers.index')->with('success', 'UniversalBanker created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create universalBanker: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $universalBanker)
    {
        // Load universalBanker relationships
        $universalBanker->load([
            'branch',
            'accounts',
            'accounts.client',
            'accounts.accountProduct',
        ]);


        // Get clients handled by this universalBanker (unique clients)
        $clients = $universalBanker->accounts->pluck('client')->unique('id')->values();

        // Get accounts with eager loading
        $accounts = $universalBanker->accounts()
            ->with(['client', 'accountProduct'])
            ->where('status', 'active')
            ->get();

        // Get date range - last 60 days
        $endDate = now()->format('Y-m-d');
        $startDate = now()->subDays(365)->format('Y-m-d');

        // Get the universalBanker's daily balance data
        $universalBankerDailyBalances = UniversalBankerDailyBalance::where('universal_banker_id', $universalBanker->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        // Calculate account statistics
        $accountStats = [
            'total' => $accounts->count(),
            'byStatus' => $accounts->groupBy('status')
                ->map(fn($group) => $group->count()),
            'byAccountProduct' => $accounts->groupBy('account_product.name')
                ->map(fn($group) => $group->count()),
            'totalBalance' => UniversalBankerDailyBalance::where('universal_banker_id', $universalBanker->id)
                ->where('date', $endDate)
                ->first()
                ?->total_balance ?? 0,
        ];

        // Get recent accounts
        $recentAccounts = $universalBanker->accounts()->orderBy('opened_at', 'desc')->take(5)->get();



        // Format for frontend
        $dailyBalances = $universalBankerDailyBalances->map(function ($record) {
            return [
                'date' => $record->date->format('Y-m-d'),
                'totalBalance' => (float)$record->total_balance,
                'formattedDate' => $record->date->format('d M'),
                'change' => (float)$record->daily_change,
            ];
        });

        // Calculate highest and lowest balances
        // Fixed algorithm: Initialize with null to handle empty collections properly
        $highestBalance = 0;
        $lowestBalance = PHP_FLOAT_MAX;

        // Only calculate if we have data
        $highestBalance = $dailyBalances->max('totalBalance');
        $lowestBalance = $dailyBalances->min('totalBalance');

        // Calculate total change from first to last day
        $firstBalance = $dailyBalances->first()['totalBalance'] ?? 0;
        $lastBalance = $dailyBalances->last()['totalBalance'] ?? 0;
        $totalChange = $lastBalance - $firstBalance;
        $percentageChange = $firstBalance > 0 ? ($totalChange / $firstBalance * 100) : 0;

        return Inertia::render('Dashboard/UniversalBankers/Show', [
            'universalBanker' => $universalBanker,
            'accountStats' => $accountStats,
            'clients' => $clients,
            'recentAccounts' => $recentAccounts,
            'dailyBalances' => $dailyBalances,
            'highestBalance' => $highestBalance,
            'lowestBalance' => $lowestBalance,
            'totalChange' => $totalChange,
            'percentageChange' => $percentageChange,
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $universalBanker)
    {
        //
        $universalBanker->load('branch');
        return Inertia::render('Dashboard/UniversalBankers/Edit', [
            'user' => $universalBanker,
            'branches' => Branch::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $universalBanker)
    {
        //
        $validatedData = $request->validated();
        try {
            if ($validatedData['is_change_password'] && !empty($validatedData['password'])) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }
            $universalBanker->update([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'branch_id' => $validatedData['branch_id'],
                'password' => $validatedData['password'] ?? $universalBanker->password, // Keep old password if not changing
            ]);
            return redirect()->route('universalBankers.index')->with('success', 'UniversalBanker updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update universalBanker: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $universalBanker)
    {
        //
        try {
            $universalBanker->delete();
            return redirect()->route('universalBankers.index')->with('success', 'UniversalBanker deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete universalBanker: ' . $e->getMessage());
        }
    }
}
