<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use Inertia\Inertia;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Account;
use App\Models\AccountProduct;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //

        return Inertia::render('Dashboard/Clients/Index', [
            'clients' => Client::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Dashboard/Clients/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        //
        $validatedData = $request->validated();

        try {
            Client::create($validatedData);
            return redirect()->route('clients.index')->with('success', 'Client created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create client: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        //
        $client->load([
            'accounts',
            'accounts.accountProduct',
            'accounts.universalBanker',
            'accounts.universalBanker.branch',
        ]);

        return Inertia::render('Dashboard/Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        //
        return Inertia::render('Dashboard/Clients/Edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        //
        $validatedData = $request->validated();
        try {
            $client->update($validatedData);
            return redirect()->route('clients.index')->with('success', 'Client updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update client: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        //
        try {
            $client->delete();
            return redirect()->route('clients.index')->with('success', 'Client deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete client: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new account for the specified client.
     */
    public function createAccount(Client $client)
    {
        $accountProducts = AccountProduct::all();
        $universalBankers = User::with('branch')->get();

        return Inertia::render('Dashboard/Clients/Accounts/Create', [
            'client' => $client,
            'accountProducts' => $accountProducts,
            'universalBankers' => $universalBankers,
        ]);
    }

    /**
     * Store a newly created account for the specified client.
     */
    public function storeAccount(Request $request, Client $client)
    {
        $validatedData = $request->validate([
            'account_number' => 'required|string|max:255|unique:accounts,account_number',
            'account_product_id' => 'required|exists:account_products,id',
            'universal_banker_id' => 'required|exists:users,id',
            'currency' => 'required|string|max:3',
            'initial_balance' => 'required|numeric|min:50000',
            'status' => 'required|string|max:255',
            'opened_at' => 'required|date',
        ]);

        try {
            $client->accounts()->create([
                'account_number' => $validatedData['account_number'],
                'account_product_id' => $validatedData['account_product_id'],
                'universal_banker_id' => $validatedData['universal_banker_id'],
                'currency' => $validatedData['currency'],
                'current_balance' => $validatedData['initial_balance'],
                'available_balance' => $validatedData['initial_balance'],
                'status' => $validatedData['status'],
                'opened_at' => $validatedData['opened_at'],
            ]);
            return redirect()->route('clients.show', $client)->with('success', 'Account created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create account: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified account of the client.
     */
    public function editAccount(Client $client, Account $account)
    {
        $accountProducts = AccountProduct::all();
        $universalBankers = User::with('branch')->get();
        $account->load('accountProduct', 'universalBanker');

        return Inertia::render('Dashboard/Clients/Accounts/Edit', [
            'client' => $client,
            'account' => $account,
            'accountProducts' => $accountProducts,
            'universalBankers' => $universalBankers,
        ]);
    }

    /**
     * Update the specified account of the client.
     */
    public function updateAccount(Request $request, Client $client, Account $account)
    {
        $validatedData = $request->validate([
            'account_product_id' => 'required|exists:account_products,id',
            'universal_banker_id' => 'required|exists:users,id',
            'account_number' => 'required|string|max:255|unique:accounts,account_number,' . $account->id,
            'current_balance' => 'required|numeric|min:0',
            'available_balance' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'status' => 'required|in:active,inactive, blocked',
        ]);

        try {
            $account->update($validatedData);
            return redirect()->route('clients.show', $client)->with('success', 'Account updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update account: ' . $e->getMessage());
        }
    }
}
