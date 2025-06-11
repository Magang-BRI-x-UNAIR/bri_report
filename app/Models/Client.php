<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    //
    use HasFactory;

    protected $table = 'clients';


    protected $fillable = [
        'cif',
        'name',
        'email',
        'phone',
        'status',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];



    public function accounts()
    {
        return $this->hasMany(Account::class, 'client_id', 'id');
    }
}
