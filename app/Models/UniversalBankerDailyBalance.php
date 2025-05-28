<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniversalBankerDailyBalance extends Model
{
    //
    protected $table = 'universalBanker_daily_balances';
    protected $fillable = [
        'universal_banker_id',
        'date',
        'total_balance',
        'daily_change',
        'transaction_count',
    ];

    protected $casts = [
        'date' => 'date',
        'total_balance' => 'decimal:2',
        'daily_change' => 'decimal:2',
        'transaction_count' => 'integer',
    ];

    public function universalBanker()
    {
        return $this->belongsTo(User::class, 'universal_banker_id');
    }
}
