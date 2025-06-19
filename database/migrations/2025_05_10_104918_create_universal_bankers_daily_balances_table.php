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
        Schema::create('universal_banker_daily_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('universal_banker_id')->constrained('universal_bankers')->onDelete('cascade');
            $table->date('date');
            $table->decimal('total_balance', 15, 2);
            $table->timestamps();
            $table->unique(['universal_banker_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('universalBanker_daily_balances');
    }
};
