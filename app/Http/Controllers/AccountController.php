<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $accounts = Account::with(['client', 'accountProduct', 'universalBanker'])->get();
        return Inertia::render('Dashboard/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        /** @var \App\Models\User|\Illuminate\Contracts\Auth\Authenticatable|null $user */
        $user = Auth::user();
        if (!$user->hasRole('super_admin')) {
            return redirect()->route('accounts.index')->with('error', 'You do not have permission to create accounts.');
        }
        return Inertia::render('Dashboard/Accounts/Create', [
            'clients' => \App\Models\Client::all(),
            'accountProducts' => \App\Models\AccountProduct::all(),
            'universalBankers' => \App\Models\UniversalBanker::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountRequest $request)
    {
        //
        try {
            $validatedData = $request->validated();
            Account::create($validatedData);
            return redirect()->route('accounts.index')->with('success', 'Account created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create account: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $account)
    {
        //
        $account->load([
            'client',
            'accountProduct',
            'universalBanker',
            'universalBanker.branch',
            'accountTransactions',
        ]);

        return Inertia::render('Dashboard/Accounts/Show', [
            'account' => $account,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account)
    {
        //
        $account->load(['client', 'accountProduct', 'universalBanker']);

        return Inertia::render('Dashboard/Accounts/Edit', [
            'account' => $account,
            'clients' => \App\Models\Client::all(),
            'accountProducts' => \App\Models\AccountProduct::all(),
            'universalBankers' => \App\Models\User::role('universal_banker')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountRequest $request, Account $account)
    {
        //
        $validatedData = $request->validated();
        try {
            $account->update($validatedData);
            return redirect()->route('accounts.index')->with('success', 'Account updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update account: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        //
        /** @var \App\Models\User|\Illuminate\Contracts\Auth\Authenticatable|null $user */
        $user = Auth::user();
        if (!$user->hasRole('super_admin')) {
            return redirect()->route('accounts.index')->with('error', 'You do not have permission to delete accounts.');
        }
        try {
            $account->delete();
            return redirect()->route('accounts.index')->with('success', 'Account deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete account: ' . $e->getMessage());
        }
    }
}
