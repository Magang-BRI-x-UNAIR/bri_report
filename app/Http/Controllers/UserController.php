<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Branch;
use App\Models\Position;
use Inertia\Inertia;
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

        // Calculate account statistics
        $accountStats = [
            'total' => $accounts->count(),
            'byStatus' => $accounts->groupBy('status')
                ->map(fn($group) => $group->count()),
            'byAccountProduct' => $accounts->groupBy('account_product.name')
                ->map(fn($group) => $group->count()),
            'totalBalance' => $accounts->sum('current_balance'),
        ];

        // Get recent accounts
        $recentAccounts = $teller->accounts()->orderBy('opened_at', 'desc')->take(5)->get();

        // Get daily balance data for the last 60 days
        $endDate = now(); // Use current date
        $startDate = $endDate->copy()->subDays(60);

        // Get all transactions for this teller's accounts in the date range
        $transactions = AccountTransaction::whereIn('account_id', $accounts->pluck('id'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at')
            ->get();

        // Group transactions by date
        $transactionsByDate = $transactions->groupBy(function ($transaction) {
            return $transaction->created_at->format('Y-m-d');
        });
        // Calculate daily balances
        $dailyBalances = [];
        $currentDate = $startDate->copy();

        // Get the initial balance at the start date
        $initialBalance = $accounts->sum(function ($account) use ($startDate) {
            // Get the balance just before our start date, or use current balance if no transactions exist
            $earliestTransaction = AccountTransaction::where('account_id', $account->id)
                ->where('created_at', '<', $startDate)
                ->orderBy('created_at', 'desc')
                ->first();

            return $earliestTransaction ? $earliestTransaction->new_balance : $account->current_balance;
        });

        $cumulativeBalance = $initialBalance;
        $previousBalance = $initialBalance;

        // Process each day in the date range
        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');

            // If we have real transactions for this date
            if (isset($transactionsByDate[$dateStr])) {
                $dayTransactions = $transactionsByDate[$dateStr];
                // Calculate net change for the day
                $dayChange = $dayTransactions->sum('amount');
                $cumulativeBalance += $dayChange;
            } else {
                // No transactions for this day
                // Create a zero-amount transaction record for continuity
                $dayChange = 0;

                // For our first account (could pick any active account)
                if ($accounts->count() > 0) {
                    $firstAccount = $accounts->first();

                    // Create a placeholder transaction with zero amount
                    AccountTransaction::create([
                        'account_id' => $firstAccount->id,
                        'amount' => 0,
                        'previous_balance' => $cumulativeBalance,
                        'new_balance' => $cumulativeBalance,
                        'created_at' => $currentDate->copy()->setTime(9, 0, 0), // Set time to 9:00 AM
                        'updated_at' => $currentDate->copy()->setTime(9, 0, 0),
                    ]);
                }

                // No change to cumulative balance
            }

            // Add to daily balances array
            $dailyBalances[] = [
                'date' => $dateStr,
                'totalBalance' => $cumulativeBalance,
                'formattedDate' => $currentDate->format('d M'),
                'change' => $cumulativeBalance - $previousBalance,
            ];

            // Update previous balance for the next iteration
            $previousBalance = $cumulativeBalance;

            // Move to next day
            $currentDate->addDay();
        }

        // Ensure the final balance exactly matches current total balance
        if (count($dailyBalances) > 0) {
            $lastIndex = count($dailyBalances) - 1;

            // If there's a discrepancy, adjust the final entry
            if (abs($dailyBalances[$lastIndex]['totalBalance'] - $accountStats['totalBalance']) > 0.01) {
                $dailyBalances[$lastIndex]['totalBalance'] = $accountStats['totalBalance'];
            }
        }

        return Inertia::render('Dashboard/Tellers/Show', [
            'teller' => $teller,
            'accountStats' => $accountStats,
            'clients' => $clients,
            'recentAccounts' => $recentAccounts,
            'dailyBalances' => $dailyBalances,
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
