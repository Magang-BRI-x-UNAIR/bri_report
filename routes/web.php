<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
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
    Route::resource('positions', PositionController::class);
    Route::resource('tellers', UserController::class);
    Route::resource('accounts', AccountController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
