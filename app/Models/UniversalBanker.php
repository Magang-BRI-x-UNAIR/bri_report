<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UniversalBanker extends Model
{
    /** @use HasFactory<\Database\Factories\UniversalBankerFactory> */
    use HasFactory;

    protected $table = 'universal_bankers';
    protected $fillable = [
        'nip',
        'name',
        'email',
        'phone',
        'address',
        'branch_id',
    ];

    /**
     * Get the branch that the universal banker belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Branch>
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'id');
    }

    /**
     * Get the accounts managed by the universal banker.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Account>
     */
    public function accounts()
    {
        return $this->hasMany(Account::class, 'universal_banker_id', 'id');
    }

    /**
     * Get the user's universalBanker daily balances.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<UniversalBankerDailyBalance>
     */
    public function universalBankerDailyBalances()
    {
        return $this->hasMany(UniversalBankerDailyBalance::class, 'universal_banker_id', localKey: 'id');
    }
}
