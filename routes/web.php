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

    Route::prefix('clients/{client}/accounts')->controller(ClientController::class)->group(function () {
        Route::get('create', 'createAccount')->name('clients.accounts.create');
        Route::post('/',  'storeAccount')->name('clients.accounts.store');
        Route::get('{account}/edit',  'editAccount')->name('clients.accounts.edit');
        Route::patch('{account}',  'updateAccount')->name('clients.accounts.update');
        Route::delete('{account}',  'destroyAccount')->name('clients.accounts.destroy');
        Route::get('{account}',  'showAccount')->name('clients.accounts.show');
    });

    Route::prefix('profile')->controller(ProfileController::class)->group(function () {
        Route::get('/',  'index')->name('profile.index');
        Route::get('edit', 'edit')->name('profile.edit');
        Route::patch('update', 'update')->name('profile.update');
    });

    Route::resource('clients', ClientController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('universalBankers', UserController::class);
    Route::resource('accounts', AccountController::class);
});

require __DIR__ . '/auth.php';
