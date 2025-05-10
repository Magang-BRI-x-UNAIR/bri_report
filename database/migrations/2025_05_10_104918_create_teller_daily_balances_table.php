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
        Schema::create('teller_daily_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->decimal('total_balance', 15, 2);
            $table->decimal('daily_change', 15, 2)->default(0);
            $table->integer('transaction_count')->default(0);
            $table->timestamps();
            $table->unique(['teller_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teller_daily_balances');
    }
};
