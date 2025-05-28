<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});



Route::prefix('dashboard')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('Dashboard/Index');
    })->middleware(['auth', 'verified'])->name('dashboard');

    Route::resource('account-products', AccountProductController::class);

    Route::prefix('clients/{client}')->group(function () {
        Route::get('accounts/create', [ClientController::class, 'createAccount'])->name('clients.accounts.create');
        Route::post('accounts', [ClientController::class, 'storeAccount'])->name('clients.accounts.store');
        Route::get('accounts/{account}/edit', [ClientController::class, 'editAccount'])->name('clients.accounts.edit');
        Route::patch('accounts/{account}', [ClientController::class, 'updateAccount'])->name('clients.accounts.update');
    });

    Route::resource('clients', ClientController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('universalBankers', UserController::class);
    Route::resource('accounts', AccountController::class);

    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('profile.index');
        Route::get('edit', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('update', [ProfileController::class, 'update'])->name('profile.update');
    });
});

require __DIR__ . '/auth.php';
