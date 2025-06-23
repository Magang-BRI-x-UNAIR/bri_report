<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        return Inertia::render('Dashboard/Branches/Index', [
            'branches' => Branch::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBranchRequest $request)
    {
        //
        $validatedData = $request->validated();
        try {
            Branch::create($validatedData);
            return redirect()->route('branches.index')->with('success', 'Branch created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create branch: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Branch $branch)
    {
        //
        $branch->load('universalBankers');
        return Inertia::render('Dashboard/Branches/Show', [
            'branch' => $branch,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        //
        $validatedData = $request->validated();

        try {
            $branch->update($validatedData);
            return redirect()->route('branches.index')->with('success', 'Branch updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update branch: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch)
    {
        //
        try {
            $branch->delete();
            return redirect()->route('branches.index')->with('success', 'Branch deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete branch: ' . $e->getMessage());
        }
    }
}
