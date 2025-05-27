<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TellerDailyBalance extends Model
{
    //
    protected $table = 'teller_daily_balances';
    protected $fillable = [
        'teller_id',
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

    public function teller()
    {
        return $this->belongsTo(User::class, 'teller_id');
    }
}
