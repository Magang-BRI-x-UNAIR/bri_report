<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use Inertia\Inertia;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //

        return Inertia::render('Dashboard/Positions/Index', [
            'positions' => Position::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePositionRequest $request)
    {
        $validatedData = $request->validated();
        try {
            Position::create($validatedData);
            return redirect()->route('positions.index')->with('success', 'Position created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create position: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Position $position)
    {
        //
        $position->load('users');
        return Inertia::render('Dashboard/Positions/Show', [
            'position' => $position,
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePositionRequest $request, Position $position)
    {
        //
        $validatedData = $request->validated();
        try {
            $position->update($validatedData);
            return redirect()->route('positions.index')->with('success', 'Position updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update position: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Position $position)
    {
        //
        try {
            $position->delete();
            return redirect()->route('positions.index')->with('success', 'Position deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete position: ' . $e->getMessage());
        }
    }
}
