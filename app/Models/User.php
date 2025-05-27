<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'password',
        'position_id',
        'branch_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the attributes that should be appended.
     *
     * @return array<string>
     */
    protected function appends(): array
    {
        return [
            'position',
        ];
    }
    /**
     * Get the user's position.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Position>
     */
    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id', 'id');
    }

    /**
     * Get the user's branch.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Branch>
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'id');
    }

    /**
     * Get the user's accounts.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Account>
     */
    public function accounts()
    {
        return $this->hasMany(Account::class, 'teller_id', localKey: 'id');
    }

    /**
     * Get the user's teller daily balances.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TellerDailyBalance>
     */
    public function tellerDailyBalances()
    {
        return $this->hasMany(TellerDailyBalance::class, 'teller_id', localKey: 'id');
    }
}
