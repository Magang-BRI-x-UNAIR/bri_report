<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AccountProduct;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing clients, products and tellers
        $clients = Client::all();
        $accountProducts = AccountProduct::all();
        $tellers = User::where('position_id', function ($query) {
            $query->select('id')
                ->from('positions')
                ->where('name', 'like', '%Teller%');
        })->get();

        // If no account products exist, we can't proceed
        if ($accountProducts->isEmpty()) {
            $this->command->error('No account products found. Please run the AccountProductSeeder first.');
            return;
        }

        // If no tellers exist, we use any available user
        if ($tellers->isEmpty()) {
            $tellers = User::all();
            if ($tellers->isEmpty()) {
                $this->command->error('No users found. Please run the UserSeeder first.');
                return;
            }
        }

        // Ensure we have clients
        if ($clients->isEmpty()) {
            $this->command->error('No clients found. Please run the ClientSeeder first.');
            return;
        }

        $this->command->info('Creating accounts for existing clients...');

        // Track our progress
        $bar = $this->command->getOutput()->createProgressBar($clients->count());
        $bar->start();

        // Create accounts
        $accounts = [];
        $accountTransactions = [];
        $now = Carbon::now();

        // Each client will have 1-3 accounts
        foreach ($clients as $client) {
            $accountCount = rand(1, 3);

            for ($i = 0; $i < $accountCount; $i++) {
                // Determine account type
                $accountProduct = $accountProducts->random();
                $teller = $tellers->random();

                // Create base account using factory but don't persist yet
                $account = Account::factory()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'teller_id' => $teller->id,
                    // Set the opened_at date to 61 days ago from March 9, 2025
                    'opened_at' => Carbon::create(2025, 3, 9)->subDays(61),
                ]);

                // Special account types - with more realistic distribution
                $rand = rand(1, 100);
                if ($rand > 95) {
                    // 5% chance of high balance account
                    $account = Account::factory()->highBalance()->make([
                        'client_id' => $client->id,
                        'account_product_id' => $accountProduct->id,
                        'teller_id' => $teller->id,
                        'opened_at' => Carbon::create(2025, 3, 9)->subDays(61),
                    ]);
                } elseif ($rand > 80) {
                    // 15% chance of low balance account
                    $account = Account::factory()->lowBalance()->make([
                        'client_id' => $client->id,
                        'account_product_id' => $accountProduct->id,
                        'teller_id' => $teller->id,
                        'opened_at' => Carbon::create(2025, 3, 9)->subDays(61),
                    ]);
                } elseif ($rand > 75) {
                    // 5% chance of USD account
                    $account = Account::factory()->usdCurrency()->make([
                        'client_id' => $client->id,
                        'account_product_id' => $accountProduct->id,
                        'teller_id' => $teller->id,
                        'opened_at' => Carbon::create(2025, 3, 9)->subDays(61),
                    ]);
                }

                // Prepare account data for bulk insertion
                $accounts[] = [
                    'account_number' => $account->account_number,
                    'current_balance' => $account->current_balance,
                    'available_balance' => $account->available_balance,
                    'currency' => $account->currency,
                    'status' => $account->status,
                    'opened_at' => $account->opened_at,
                    'client_id' => $account->client_id,
                    'account_product_id' => $account->account_product_id,
                    'teller_id' => $account->teller_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $bar->advance();
            }
        }

        // Bulk insert accounts (much faster than individual inserts)
        DB::table('accounts')->insert($accounts);

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Successfully created ' . count($accounts) . ' accounts!');

        // Now let's create 60 days of account transactions for each account
        $this->command->info('Creating 60 days of account transactions...');
        $accounts = Account::all();

        $bar = $this->command->getOutput()->createProgressBar($accounts->count());
        $bar->start();

        $transactions = [];

        // Define the end date (March 9, 2025)
        $endDate = Carbon::create(2025, 4, 9);

        // For consistent transaction patterns
        $transactionPatterns = [
            'weekly_salary' => ['day' => 'friday', 'amount' => [3000000, 7000000]],
            'monthly_salary' => ['day' => 1, 'amount' => [5000000, 15000000]],
            'monthly_rent' => ['day' => 5, 'amount' => [-1000000, -3000000]],
            'utility_bill' => ['day' => 10, 'amount' => [-100000, -500000]],
            'grocery_shopping' => ['frequency' => 3, 'amount' => [-200000, -800000]],
            'dining_out' => ['frequency' => 5, 'amount' => [-50000, -300000]],
            'entertainment' => ['frequency' => 2, 'amount' => [-100000, -500000]],
            'transport' => ['frequency' => 10, 'amount' => [-20000, -100000]],
        ];

        foreach ($accounts as $account) {
            // Setup the start balance and date
            $startDate = Carbon::parse($account->opened_at);
            $startBalance = $account->currency === 'IDR' ? rand(1000000, 5000000) : rand(100, 500);
            $balance = $startBalance;
            $previousBalance = 0;

            // Assign some random transaction patterns to this account
            $accountPatterns = [];
            foreach ($transactionPatterns as $key => $pattern) {
                // 50% chance to have each pattern
                if (rand(0, 1)) {
                    $accountPatterns[$key] = $pattern;
                }
            }

            // First transaction is the opening deposit
            $transactions[] = [
                'account_id' => $account->id,
                'amount' => $balance,
                'previous_balance' => 0,
                'new_balance' => $balance,
                'created_at' => $startDate,
                'updated_at' => $startDate,
            ];

            $previousBalance = $balance;
            $currentDay = $startDate->copy()->addDay();

            // Generate transactions for each day until we reach March 9, 2025
            while ($currentDay->lte($endDate)) {
                // Generate 0-3 transactions for this day
                $dayTransactionsCount = rand(0, 3);

                // Check for recurring pattern transactions
                foreach ($accountPatterns as $key => $pattern) {
                    // Check weekly patterns
                    if (isset($pattern['day']) && is_string($pattern['day']) && strtolower($currentDay->format('l')) === $pattern['day']) {
                        // It's a weekly pattern day (like salary on Friday)
                        $amount = rand($pattern['amount'][0], $pattern['amount'][1]);

                        // Adjust amount based on currency
                        if ($account->currency === 'USD') {
                            $amount = $amount / 15000; // Approximate USD conversion
                        }

                        $balance += $amount;

                        $transactionTime = $currentDay->copy()->setTime(rand(8, 17), rand(0, 59), rand(0, 59));

                        $transactions[] = [
                            'account_id' => $account->id,
                            'amount' => $amount,
                            'previous_balance' => $previousBalance,
                            'new_balance' => $balance,
                            'created_at' => $transactionTime,
                            'updated_at' => $transactionTime,
                        ];

                        $previousBalance = $balance;
                    }

                    // Check monthly patterns (bill payments, rent, etc.)
                    if (isset($pattern['day']) && is_numeric($pattern['day']) && $currentDay->day === $pattern['day']) {
                        // It's a monthly pattern day (like rent on the 5th)
                        $amount = rand($pattern['amount'][0], $pattern['amount'][1]);

                        // Adjust amount based on currency
                        if ($account->currency === 'USD') {
                            $amount = $amount / 15000; // Approximate USD conversion
                        }

                        $balance += $amount;

                        $transactionTime = $currentDay->copy()->setTime(rand(8, 17), rand(0, 59), rand(0, 59));

                        $transactions[] = [
                            'account_id' => $account->id,
                            'amount' => $amount,
                            'previous_balance' => $previousBalance,
                            'new_balance' => $balance,
                            'created_at' => $transactionTime,
                            'updated_at' => $transactionTime,
                        ];

                        $previousBalance = $balance;
                    }

                    // Check frequency-based patterns
                    if (isset($pattern['frequency']) && rand(1, 30) <= $pattern['frequency']) {
                        // Random chance based on frequency value
                        $amount = rand($pattern['amount'][0], $pattern['amount'][1]);

                        // Adjust amount based on currency
                        if ($account->currency === 'USD') {
                            $amount = $amount / 15000; // Approximate USD conversion
                        }

                        $balance += $amount;

                        $transactionTime = $currentDay->copy()->setTime(rand(8, 17), rand(0, 59), rand(0, 59));

                        $transactions[] = [
                            'account_id' => $account->id,
                            'amount' => $amount,
                            'previous_balance' => $previousBalance,
                            'new_balance' => $balance,
                            'created_at' => $transactionTime,
                            'updated_at' => $transactionTime,
                        ];

                        $previousBalance = $balance;
                    }
                }

                // Generate random transactions for this day
                for ($i = 0; $i < $dayTransactionsCount; $i++) {
                    // Random transaction type (credit or debit)
                    $type = rand(1, 100) > 40 ? 'credit' : 'debit'; // 60% credits, 40% debits

                    if ($type === 'credit') {
                        $amount = rand(50000, 1000000); // Random deposit
                        if ($account->currency === 'USD') {
                            $amount = rand(5, 100); // USD deposits
                        }

                        $balance += $amount;
                    } else {
                        // Ensure withdrawals don't exceed available balance
                        $maxWithdrawal = min($balance * 0.7, 1000000); // Limit withdrawals
                        if ($account->currency === 'USD') {
                            $maxWithdrawal = min($balance * 0.7, 100);
                        }

                        if ($maxWithdrawal < 10000 && $account->currency === 'IDR') {
                            // Skip if balance is too low for IDR
                            continue;
                        } else if ($maxWithdrawal < 5 && $account->currency === 'USD') {
                            // Skip if balance is too low for USD
                            continue;
                        }

                        $amount = -1 * rand(
                            $account->currency === 'IDR' ? 10000 : 5,
                            max((int)$maxWithdrawal, $account->currency === 'IDR' ? 10000 : 5)
                        );

                        $balance += $amount; // Amount is negative
                    }

                    // Create the transaction with a random time on current day
                    $transactionTime = $currentDay->copy()->setTime(rand(8, 17), rand(0, 59), rand(0, 59));

                    $transactions[] = [
                        'account_id' => $account->id,
                        'amount' => $amount,
                        'previous_balance' => $previousBalance,
                        'new_balance' => $balance,
                        'created_at' => $transactionTime,
                        'updated_at' => $transactionTime,
                    ];

                    $previousBalance = $balance;
                }

                // Move to the next day
                $currentDay->addDay();
            }

            $bar->advance();
        }

        // Update final account balances to match the last transaction
        $accountBalanceUpdates = collect($transactions)
            ->groupBy('account_id')
            ->map(function ($accountTransactions) {
                return collect($accountTransactions)->sortBy('created_at')->last();
            })
            ->map(function ($lastTransaction) {
                return [
                    'id' => $lastTransaction['account_id'],
                    'current_balance' => $lastTransaction['new_balance'],
                    'available_balance' => $lastTransaction['new_balance'] * rand(95, 100) / 100, // Slight variance
                ];
            })
            ->values()
            ->toArray();

        // Bulk insert transactions in chunks (to avoid memory issues)
        foreach (array_chunk($transactions, 1000) as $chunk) {
            DB::table('account_transactions')->insert($chunk);
        }

        // Update account balances to match their transaction history
        foreach ($accountBalanceUpdates as $update) {
            DB::table('accounts')
                ->where('id', $update['id'])
                ->update([
                    'current_balance' => $update['current_balance'],
                    'available_balance' => $update['available_balance'],
                ]);
        }

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Successfully created ' . count($transactions) . ' transactions across 60 days!');
        $this->command->info('Average of ' . round(count($transactions) / $accounts->count(), 2) . ' transactions per account');
    }

    /**
     * Get a faker instance
     */
    private function faker()
    {
        return \Faker\Factory::create('id_ID');
    }
}
