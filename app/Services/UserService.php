<?php

namespace App\Services;

use App\Models\User;
use App\Models\Branch;
use App\Models\UniversalBankerDailyBalance;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class UserService
{
    /**
     * Get all universal bankers with their branch.
     *
     * @return EloquentCollection<User>
     */
    public function getAllUniversalBankers(): EloquentCollection
    {
        return User::role('universal_banker')->with(['branch'])->get();
    }



    /**
     * Get all branches.
     *
     * @return EloquentCollection<Branch>
     */
    public function getAllBranches(): EloquentCollection
    {
        return Branch::all();
    }

    /**
     * Create a new universal banker.
     *
     * @param array $data
     * @return User
     */
    public function createUniversalBanker(array $data): User
    {
        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);
        $user->assignRole('universal_banker');

        return $user;
    }

    /**
     * Update a universal banker's information.
     *
     * @param User $universalBanker
     * @param array $data
     * @return User
     */
    public function updateUniversalBanker(User $universalBanker, array $data): User
    {
        if (isset($data['is_change_password']) && $data['is_change_password'] && !empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'branch_id' => $data['branch_id'],
            'nip' => $data['nip'] ?? $universalBanker->nip,
        ];

        if (isset($data['password'])) {
            $updateData['password'] = $data['password'];
        }


        $universalBanker->update($updateData);

        return $universalBanker;
    }

    /**
     * Delete a universal banker.
     *
     * @param User $universalBanker
     * @return bool
     */
    public function deleteUniversalBanker(User $universalBanker): bool
    {
        return $universalBanker->delete();
    }

    /**
     * Get universal banker details with relationships and statistics.
     *
     * @param User $universalBanker
     * @param int $daysBack
     * @return array
     */
    public function getUniversalBankerDetails(User $universalBanker, int $daysBack = 365): array
    {
        $universalBanker->load([
            'branch',
            'accounts' => function ($query) {
                $query->with(['client', 'accountProduct'])
                    ->orderBy('opened_at', 'desc');
            },
        ]);

        $loadedAccounts = $universalBanker->accounts;
        $clients = $loadedAccounts->pluck('client')->filter()->unique('id')->values();

        // Get date range
        $endDate = now();
        $startDate = now()->subDays($daysBack);

        // Get daily balance data
        $universalBankerDailyBalances = UniversalBankerDailyBalance::where('universal_banker_id', $universalBanker->id)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]) // Gunakan format Y-m-d untuk query BETWEEN
            ->orderBy('date', 'asc')
            ->get();

        // Calculate account statistics
        $accountStats = $this->calculateAccountStatistics($loadedAccounts, $universalBanker->id, $endDate->format('Y-m-d'));

        $recentAccounts = $loadedAccounts->take(5);

        $dailyBalances = $this->formatDailyBalances($universalBankerDailyBalances);

        $balanceMetrics = $this->calculateBalanceMetrics($dailyBalances);

        return [
            'universalBanker' => $universalBanker,
            'accountStats' => $accountStats,
            'clients' => $clients,
            'recentAccounts' => $recentAccounts,
            'dailyBalances' => $dailyBalances,
            'highestBalance' => $balanceMetrics['highestBalance'],
            'lowestBalance' => $balanceMetrics['lowestBalance'],
            'totalChange' => $balanceMetrics['totalChange'],
            'percentageChange' => $balanceMetrics['percentageChange'],
        ];
    }
    /**
     * Calculate account statistics.
     *
     * @param EloquentCollection $accounts // Berasal dari $universalBanker->accounts yang sudah di-load
     * @param int $universalBankerId
     * @param string $endDateString
     * @return array
     */
    private function calculateAccountStatistics(EloquentCollection $accounts, int $universalBankerId, string $endDateString): array
    {
        return [
            'total' => $accounts->count(),
            'byStatus' => $accounts->groupBy('status')
                ->map(fn($group) => $group->count()),
            'byAccountProduct' => $accounts->filter(fn($account) => $account->accountProduct)
                ->groupBy('accountProduct.name')
                ->map(fn($group) => $group->count()),
            'todayBalance' => UniversalBankerDailyBalance::where('universal_banker_id', $universalBankerId)
                ->where('date', $endDateString)
                ->first()
                ?->total_balance ?? 0,
            'totalBalance' => $accounts->sum('balance'),
        ];
    }

    /**
     * Format daily balances for frontend.
     *
     * @param EloquentCollection $universalBankerDailyBalances
     * @return Collection
     */
    private function formatDailyBalances(EloquentCollection $universalBankerDailyBalances): Collection
    {
        return $universalBankerDailyBalances->map(function ($record) {
            $dateInstance = $record->date instanceof \Carbon\Carbon ? $record->date : \Carbon\Carbon::parse($record->date);
            return [
                'date' => $dateInstance->format('Y-m-d'),
                'totalBalance' => (float)$record->total_balance,
                'formattedDate' => $dateInstance->format('d M'), // Pastikan locale 'id' jika diperlukan di sini atau di frontend
                'change' => (float)$record->daily_change,
            ];
        });
    }

    /**
     * Calculate balance metrics.
     *
     * @param Collection $dailyBalances
     * @return array
     */
    private function calculateBalanceMetrics(Collection $dailyBalances): array
    {
        if ($dailyBalances->isEmpty()) {
            return [
                'highestBalance' => 0,
                'lowestBalance' => 0,
                'totalChange' => 0,
                'percentageChange' => 0,
            ];
        }

        $highestBalance = $dailyBalances->max('totalBalance');
        $lowestBalance = $dailyBalances->min('totalBalance');

        $firstBalance = $dailyBalances->first()['totalBalance'] ?? 0;
        $lastBalance = $dailyBalances->last()['totalBalance'] ?? 0;
        $totalChange = $lastBalance - $firstBalance;
        $percentageChange = $firstBalance != 0 ? ($totalChange / $firstBalance * 100) : 0;

        return [
            'highestBalance' => $highestBalance,
            'lowestBalance' => $lowestBalance,
            'totalChange' => $totalChange,
            'percentageChange' => round($percentageChange, 2),
        ];
    }
}
