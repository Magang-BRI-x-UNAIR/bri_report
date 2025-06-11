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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('cif')->unique()->comment('Client CIF number');
            $table->string('name')->unique()->comment('Client name');
            $table->string('email')->unique()->comment('Client email')->nullable();
            $table->string('phone')->nullable()->comment('Client phone number')->nullable();
            $table->timestamp('joined_at')->nullable()->comment('Date when the client joined')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
