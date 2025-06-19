<?php

namespace App\Services;

use App\Models\UniversalBanker;
use App\Models\Branch;
use App\Models\UniversalBankerDailyBalance;
use App\Models\Account;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class UniversalBankerService
{
    /**
     * Get all universal bankers with their branch.
     *
     * @return EloquentCollection<UniversalBanker>
     */
    public function getAllUniversalBankers(): EloquentCollection
    {
        return UniversalBanker::with('branch')
            ->orderBy('created_at', 'desc')
            ->get();
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
     * @return UniversalBanker
     */
    public function createUniversalBanker(array $data): UniversalBanker
    {
        $universalBanker = UniversalBanker::create($data);
        return $universalBanker;
    }

    /**
     * Update a universal banker's information.
     *
     * @param UniversalBanker $universalBanker
     * @param array $data
     * @return UniversalBanker
     */
    public function updateUniversalBanker(UniversalBanker $universalBanker, array $data): UniversalBanker
    {
        $universalBanker->update($data);
        return $universalBanker;
    }

    /**
     * Delete a universal banker.
     *
     * @param UniversalBanker $universalBanker
     * @return bool
     */
    public function deleteUniversalBanker(UniversalBanker $universalBanker): bool
    {
        return $universalBanker->delete();
    }

    /**
     * Get universal banker details with relationships and statistics.
     *
     * @param UniversalBanker $universalBanker
     * @param int $daysBack
     * @return array
     */
    public function getUniversalBankerDetails(UniversalBanker $universalBanker, int $daysBack = 365): array
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
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
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
     * @param \Illuminate\Database\Eloquent\Collection|\App\Models\Account[] $accounts // Berasal dari $universalBanker->accounts yang sudah di-load
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
     * @param Collection $dailyBalancesCollection
     * @return Collection
     */
    private function formatDailyBalances(Collection $dailyBalancesCollection): Collection
    {
        $formattedBalances = new Collection();
        $previousBalance = null;

        foreach ($dailyBalancesCollection as $record) {
            $currentBalance = (float) $record->total_balance;

            $dailyChange = ($previousBalance !== null) ? ($currentBalance - $previousBalance) : 0;

            $formattedBalances->push([
                'date' => $record->date->format('Y-m-d'),
                'totalBalance' => $currentBalance,
                'formattedDate' => $record->date->format('d M'),
                'change' => $dailyChange,
            ]);

            $previousBalance = $currentBalance;
        }

        return $formattedBalances;
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
