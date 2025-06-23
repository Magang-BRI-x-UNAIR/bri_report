<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    //
    protected $table = 'branches';
    protected $fillable = [
        'name',
        'address',
    ];

    public function universalBankers()
    {
        return $this->hasMany(UniversalBanker::class, 'branch_id', 'id');
    }
}
