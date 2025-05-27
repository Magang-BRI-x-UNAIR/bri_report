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

        $this->command->info('Creating accounts for clients...');

        // First, clean up existing data to avoid duplicates
        // Disable foreign key checks before truncating
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('account_transactions')->truncate();
        DB::table('accounts')->truncate();
        DB::table('teller_daily_balances')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); // Re-enable foreign key checks

        // Track our progress
        $bar = $this->command->getOutput()->createProgressBar($clients->count());
        $bar->start();

        // Setup date range
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(60);

        // Assign clients to tellers (10 accounts per teller)
        $tellerAccounts = [];
        foreach ($tellers as $teller) {
            $tellerAccounts[$teller->id] = 0;
        }

        // Create accounts - one per client
        $accounts = [];
        $now = Carbon::now();

        // Distribute clients evenly among tellers, ensuring each teller gets 10 accounts
        $clientsForSeeding = $clients->take(count($tellers) * 10); // Limit to exactly what we need
        $tellerIndex = 0;
        $currentTellerId = $tellers[$tellerIndex]->id;

        foreach ($clientsForSeeding as $index => $client) {
            // If current teller has 10 accounts, move to next teller
            if ($tellerAccounts[$currentTellerId] >= 10) {
                $tellerIndex++;
                if ($tellerIndex >= count($tellers)) {
                    break; // We've assigned all tellers their 10 accounts
                }
                $currentTellerId = $tellers[$tellerIndex]->id;
            }

            // Determine account type
            $accountProduct = $accountProducts->random();

            // Create account using factory but don't persist yet
            $account = Account::factory()->make([
                'client_id' => $client->id,
                'account_product_id' => $accountProduct->id,
                'teller_id' => $currentTellerId,
                'opened_at' => $startDate,
            ]);

            // Special account types with more realistic distribution
            $rand = rand(1, 100);
            if ($rand > 95) {
                // 5% chance of high balance account
                $account = Account::factory()->highBalance()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'teller_id' => $currentTellerId,
                    'opened_at' => $startDate,
                ]);
            } elseif ($rand > 80) {
                // 15% chance of low balance account
                $account = Account::factory()->lowBalance()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'teller_id' => $currentTellerId,
                    'opened_at' => $startDate,
                ]);
            } elseif ($rand > 75) {
                // 5% chance of USD account
                $account = Account::factory()->usdCurrency()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'teller_id' => $currentTellerId,
                    'opened_at' => $startDate,
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

            // Increment account count for this teller
            $tellerAccounts[$currentTellerId]++;

            $bar->advance();
        }

        // Bulk insert accounts (much faster than individual inserts)
        DB::table('accounts')->insert($accounts);

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Successfully created ' . count($accounts) . ' accounts!');

        // Verify each teller has 10 accounts
        foreach ($tellers as $teller) {
            $count = DB::table('accounts')->where('teller_id', $teller->id)->count();
            $this->command->info("Teller {$teller->name} has {$count} accounts");
        }

        // Now let's create 60 days of account transactions for each account
        $this->command->info('Creating 60 days of account transactions...');
        $accounts = Account::all();

        $bar = $this->command->getOutput()->createProgressBar($accounts->count());
        $bar->start();

        $transactions = [];
        $tellerDailyBalances = [];

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

        // Initialize teller balance tracking arrays
        $tellerDailyData = [];
        foreach ($tellers as $teller) {
            $tellerDailyData[$teller->id] = [];

            $currentDay = $startDate->copy();
            while ($currentDay <= $endDate) {
                $dateStr = $currentDay->format('Y-m-d');
                $tellerDailyData[$teller->id][$dateStr] = [
                    'total_balance' => 0,
                    'daily_change' => 0,
                    'transaction_count' => 0,
                ];
                $currentDay->addDay();
            }
        }

        foreach ($accounts as $account) {
            // Setup the start balance and date
            $currentDay = $startDate->copy();
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

            // Update teller daily data for opening day
            $openingDateStr = $startDate->format('Y-m-d');
            $tellerDailyData[$account->teller_id][$openingDateStr]['total_balance'] += $balance;
            $tellerDailyData[$account->teller_id][$openingDateStr]['daily_change'] += $balance;
            $tellerDailyData[$account->teller_id][$openingDateStr]['transaction_count']++;

            $previousBalance = $balance;
            $currentDay = $startDate->copy()->addDay();

            // Generate transactions for each day until we reach end date
            while ($currentDay <= $endDate) {
                $dateStr = $currentDay->format('Y-m-d');
                $dayTransactionsCount = 0;
                $dayTotalChange = 0;

                // Check for recurring pattern transactions
                foreach ($accountPatterns as $key => $pattern) {
                    // Process weekly and monthly patterns
                    if (isset($pattern['day'])) {
                        $matchDay = false;

                        // Check if it's weekly pattern day
                        if (is_string($pattern['day']) && strtolower($currentDay->format('l')) === $pattern['day']) {
                            $matchDay = true;
                        }
                        // Check if it's monthly pattern day
                        else if (is_numeric($pattern['day']) && $currentDay->day === $pattern['day']) {
                            $matchDay = true;
                        }

                        if ($matchDay) {
                            // Create the pattern transaction
                            $amount = rand($pattern['amount'][0], $pattern['amount'][1]);

                            // Adjust amount based on currency
                            if ($account->currency === 'USD') {
                                $amount = $amount / 15000;
                            }

                            $balance += $amount;
                            $dayTotalChange += $amount;

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
                            $dayTransactionsCount++;
                        }
                    }
                    // Check frequency-based patterns
                    else if (isset($pattern['frequency']) && rand(1, 30) <= $pattern['frequency']) {
                        $amount = rand($pattern['amount'][0], $pattern['amount'][1]);

                        // Adjust amount based on currency
                        if ($account->currency === 'USD') {
                            $amount = $amount / 15000;
                        }

                        $balance += $amount;
                        $dayTotalChange += $amount;

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
                        $dayTransactionsCount++;
                    }
                }

                // Generate random transactions for this day (0-2 more transactions)
                $randomTransCount = rand(0, 2);
                for ($i = 0; $i < $randomTransCount; $i++) {
                    // Random transaction type (credit or debit)
                    $isDeposit = rand(1, 100) > 40;

                    if ($isDeposit) {
                        $amount = rand(50000, 1000000);
                        if ($account->currency === 'USD') {
                            $amount = rand(5, 100);
                        }
                    } else {
                        // Ensure withdrawals don't exceed available balance
                        $maxWithdrawal = min($balance * 0.7, 1000000);
                        if ($account->currency === 'USD') {
                            $maxWithdrawal = min($balance * 0.7, 100);
                        }

                        if (($maxWithdrawal < 10000 && $account->currency === 'IDR') ||
                            ($maxWithdrawal < 5 && $account->currency === 'USD')
                        ) {
                            continue;
                        }

                        $amount = -1 * rand(
                            $account->currency === 'IDR' ? 10000 : 5,
                            max((int)$maxWithdrawal, $account->currency === 'IDR' ? 10000 : 5)
                        );
                    }

                    $balance += $amount;
                    $dayTotalChange += $amount;

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
                    $dayTransactionsCount++;
                }

                // Make sure we have at least one transaction per day (even if zero amount)
                if ($dayTransactionsCount === 0) {
                    $transactions[] = [
                        'account_id' => $account->id,
                        'amount' => 0,
                        'previous_balance' => $balance,
                        'new_balance' => $balance,
                        'created_at' => $currentDay->copy()->setTime(9, 0, 0),
                        'updated_at' => $currentDay->copy()->setTime(9, 0, 0),
                    ];

                    $dayTransactionsCount++;
                }

                // Update teller daily data
                $tellerDailyData[$account->teller_id][$dateStr]['total_balance'] += $balance;
                $tellerDailyData[$account->teller_id][$dateStr]['daily_change'] += $dayTotalChange;
                $tellerDailyData[$account->teller_id][$dateStr]['transaction_count'] += $dayTransactionsCount;

                // Move to next day
                $currentDay->addDay();
            }

            // Update account with final balance
            $account->current_balance = $balance;
            $account->available_balance = $balance * rand(95, 100) / 100;
            $account->save();

            $bar->advance();
        }

        // Bulk insert transactions in chunks
        foreach (array_chunk($transactions, 1000) as $chunk) {
            DB::table('account_transactions')->insert($chunk);
        }

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Successfully created ' . count($transactions) . ' transactions across 60 days!');

        // Now create the TellerDailyBalance records
        $this->command->info('Creating teller daily balance records...');
        $tellerBalanceRecords = [];

        foreach ($tellerDailyData as $tellerId => $dates) {
            foreach ($dates as $date => $data) {
                $tellerBalanceRecords[] = [
                    'teller_id' => $tellerId,
                    'date' => $date,
                    'total_balance' => $data['total_balance'],
                    'daily_change' => $data['daily_change'],
                    'transaction_count' => $data['transaction_count'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert teller daily balance records
        foreach (array_chunk($tellerBalanceRecords, 1000) as $chunk) {
            DB::table('teller_daily_balances')->insert($chunk);
        }

        $this->command->info('Successfully created ' . count($tellerBalanceRecords) . ' teller daily balance records!');
    }

    /**
     * Get a faker instance
     */
    private function faker()
    {
        return \Faker\Factory::create('id_ID');
    }
}
