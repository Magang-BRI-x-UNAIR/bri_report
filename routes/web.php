<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});



Route::prefix('dashboard')->middleware(['auth', 'verified'])->group(function () {
    Route::controller(DashboardController::class)->group(function () {
        Route::get('/', 'index')->name('dashboard.index');
        Route::prefix('import')->controller(DashboardController::class)->group(function () {
            Route::get('/', 'import')->name('dashboard.import');
            Route::post('/', 'processImport')->name('dashboard.import.process');
            Route::get('preview', 'preview')->name('dashboard.import.preview');
            Route::get('preview/{batch_id}', 'previewPage')->name('dashboard.import.preview');
            Route::get('status/{batch_id}', 'getImportStatus')->name('dashboard.import.status');
            Route::post('save', 'save')->name('dashboard.import.save');
            Route::get('result/{result_id}', 'importResultPage')->name('dashboard.import.result');
            Route::get('save-status/{result_id}', 'getSaveStatus')->name('dashboard.import.save.status');
        });
        Route::prefix('export')->controller(DashboardController::class)->group(function () {
            Route::get('/', 'export')->name('dashboard.export');
            Route::post('/', 'processExport')->name('dashboard.export.process');
            Route::get('result/{result_id}', 'exportResultPage')->name('dashboard.export.result');
            Route::get('status/{result_id}', 'getExportStatus')->name('dashboard.export.status');
            Route::get('/download/{result_id}', 'downloadExportedFile')->name('dashboard.export.download');
        });
    });

    Route::resource('account-products', AccountProductController::class);

    Route::prefix('clients/{client}/accounts')->controller(ClientController::class)->group(function () {
        Route::get('create', 'createAccount')->name('clients.accounts.create');
        Route::post('/',  'storeAccount')->name('clients.accounts.store');
        Route::get('{account:id}/edit',  'editAccount')->name('clients.accounts.edit');
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
