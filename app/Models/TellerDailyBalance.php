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

    public function teller()
    {
        return $this->belongsTo(User::class, 'teller_id');
    }
}
