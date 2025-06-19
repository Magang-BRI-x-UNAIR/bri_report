<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniversalBankerDailyBalance extends Model
{
    //
    protected $table = 'universal_banker_daily_balances';
    protected $fillable = [
        'universal_banker_id',
        'date',
        'total_balance',
    ];

    protected $casts = [
        'date' => 'date',
        'total_balance' => 'decimal:2',
    ];

    public function universalBanker()
    {
        return $this->belongsTo(UniversalBanker::class, 'universal_banker_id');
    }
}
