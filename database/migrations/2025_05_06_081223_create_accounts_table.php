<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_product_id')->constrained()->onDelete('cascade');
            $table->foreignId('universal_banker_id')->nullable()->constrained('universal_bankers')->onDelete('set null')->comment('ID of the universalBanker who opened the account');
            $table->string('account_number')->unique()->comment('Account/rekening number');
            $table->decimal('current_balance', 19, 4)->default(0)->comment('Current account balance');
            $table->decimal('available_balance', 19, 4)->default(0)->comment('Available balance that can be used');
            $table->string('currency', 3)->default('IDR')->comment('Account currency');
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active')->comment('Account status: active, inactive, blocked');
            $table->timestamp('opened_at')->nullable()->comment('Date when account was opened');
            $table->timestamp('last_transaction_at')->nullable()->comment('Date of last transaction');
            $table->timestamps();
            $table->unique(['client_id', 'account_product_id', 'account_number', 'universal_banker_id'], 'unique_account_universalBanker');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
