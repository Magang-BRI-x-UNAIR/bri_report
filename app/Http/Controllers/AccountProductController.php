<?php

namespace App\Http\Controllers;

use App\Models\AccountProduct;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountProductRequest;
use App\Http\Requests\UpdateAccountProductRequest;
use Inertia\Inertia;

class AccountProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $accountProducts = AccountProduct::all();
        return Inertia('Dashboard/AccountProducts/Index', [
            'accountProducts' => $accountProducts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountProductRequest $request)
    {
        //
        $validatedData = $request->validated();
        try {
            AccountProduct::create($validatedData);
            return redirect()->route('account-products.index')->with('success', 'Account product created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create account product: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AccountProduct $accountProduct)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountProductRequest $request, AccountProduct $accountProduct)
    {
        //
        $validatedData = $request->validated();
        try {
            $accountProduct->update($validatedData);
            return redirect()->route('account-products.index')->with('success', 'Account product updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update account product: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AccountProduct $accountProduct)
    {
        //
        try {
            $accountProduct->delete();
            return redirect()->route('account-products.index')->with('success', 'Account product deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete account product: ' . $e->getMessage());
        }
    }
}
