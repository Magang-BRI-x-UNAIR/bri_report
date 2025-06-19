<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    //
    use HasFactory;
    protected $table = 'accounts';


    protected $fillable = [
        'client_id',
        'account_product_id',
        'universal_banker_id',
        'account_number',
        'current_balance',
        'available_balance',
        'currency',
        'status',
        'opened_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'last_transaction_at' => 'datetime',
    ];


    public function accountProduct()
    {
        return $this->belongsTo(AccountProduct::class, 'account_product_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function universalBanker()
    {
        return $this->belongsTo(UniversalBanker::class, 'universal_banker_id');
    }

    public function accountTransactions()
    {
        return $this->hasMany(AccountTransaction::class, 'account_id');
    }
}
