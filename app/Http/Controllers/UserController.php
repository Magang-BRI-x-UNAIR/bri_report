<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Branch;
use App\Models\Position;
use Inertia\Inertia;
use App\Models\TellerDailyBalance;
use App\Models\AccountTransaction;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //

        $tellers = User::with(['position', 'branch'])->get();
        return Inertia::render('Dashboard/Tellers/Index', [
            'tellers' => $tellers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Dashboard/Tellers/Create', [
            'positions' => Position::all(),
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
            User::create($validatedData);
            return redirect()->route('tellers.index')->with('success', 'Teller created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create teller: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $teller)
    {
        // Load teller relationships
        $teller->load([
            'position',
            'branch',
            'accounts',
            'accounts.client',
            'accounts.accountProduct',
        ]);

        // Get clients handled by this teller (unique clients)
        $clients = $teller->accounts->pluck('client')->unique('id')->values();

        // Get accounts with eager loading
        $accounts = $teller->accounts()
            ->with(['client', 'accountProduct'])
            ->where('status', 'active')
            ->get();

        // Get date range - last 60 days
        $endDate = now()->format('Y-m-d');
        $startDate = now()->subDays(365)->format('Y-m-d');

        // Get the teller's daily balance data
        $tellerDailyBalances = TellerDailyBalance::where('teller_id', $teller->id)
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
            'totalBalance' => TellerDailyBalance::where('teller_id', $teller->id)
                ->where('date', $endDate)
                ->first()
                ?->total_balance ?? 0,
        ];

        // Get recent accounts
        $recentAccounts = $teller->accounts()->orderBy('opened_at', 'desc')->take(5)->get();



        // Format for frontend
        $dailyBalances = $tellerDailyBalances->map(function ($record) {
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

        return Inertia::render('Dashboard/Tellers/Show', [
            'teller' => $teller,
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
    public function edit(User $teller)
    {
        //
        $teller->load('position', 'branch');
        return Inertia::render('Dashboard/Tellers/Edit', [
            'user' => $teller,
            'positions' => Position::all(),
            'branches' => Branch::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $teller)
    {
        //
        $validatedData = $request->validated();
        try {
            $teller->update($validatedData);
            return redirect()->route('tellers.index')->with('success', 'Teller updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update teller: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $teller)
    {
        //
        try {
            $teller->delete();
            return redirect()->route('tellers.index')->with('success', 'Teller deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete teller: ' . $e->getMessage());
        }
    }
}
