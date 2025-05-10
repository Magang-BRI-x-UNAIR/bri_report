<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountProduct extends Model
{
    //

    protected $table = 'account_products';

    protected $fillable = [
        'code',
        'name',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function accounts()
    {
        return $this->hasMany(Account::class, 'account_product_id', 'id');
    }
}
