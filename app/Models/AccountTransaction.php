<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountTransaction extends Model
{
    //

    protected $table = 'account_transactions';


    protected $fillable = [
        'account_id',
        'amount',
        'previous_balance',
        'new_balance',
    ];


    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
