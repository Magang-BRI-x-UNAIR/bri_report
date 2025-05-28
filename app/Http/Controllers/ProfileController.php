<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class ProfileController extends Controller
{

    public function index(): Response
    {
        /** @var \App\Models\User|\Illuminate\Contracts\Auth\Authenticatable|null $user */
        $user = Auth::user();

        if ($user instanceof User) {
            $user->load(['branch']);
        }

        return Inertia::render('Dashboard/Profile/Index', [
            'user' => $user,
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(): Response
    {
        return Inertia::render('Dashboard/Profile/Edit', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $validatedData = $request->validated();
            if ($validatedData['is_change_password']) {
                $validatedData['password'] = bcrypt($validatedData['password']);
            } else {
                unset($validatedData['password']);
            }
            /** @var \App\Models\User|\Illuminate\Contracts\Auth\Authenticatable|null $user */
            $user = Auth::user();
            $user->update([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'password' => $validatedData['password'] ?? $user->password,
            ]);

            return Redirect::route('profile.index')->with('success', 'Profile updated successfully!');
        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            return Redirect::back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }
}
