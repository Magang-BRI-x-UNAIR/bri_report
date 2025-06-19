<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AccountProduct;
use App\Models\Client;
use App\Models\UniversalBanker;
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
        // Get existing clients, products and universalBankers
        $clients = Client::all();
        $accountProducts = AccountProduct::all();
        $universalBankers = UniversalBanker::all();

        // If no account products exist, we can't proceed
        if ($accountProducts->isEmpty()) {
            $this->command->error('No account products found. Please run the AccountProductSeeder first.');
            return;
        }

        // If no universalBankers exist, we use any available user
        if ($universalBankers->isEmpty()) {
            $universalBankers = User::all();
            if ($universalBankers->isEmpty()) {
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

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('account_transactions')->truncate();
        DB::table('accounts')->truncate();
        DB::table('universal_banker_daily_balances')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;'); // Re-enable foreign key checks

        $bar = $this->command->getOutput()->createProgressBar($clients->count());
        $bar->start();

        // Setup date range
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(60);

        // Assign clients to universalBankers (10 accounts per universalBanker)
        $universalBankerAccounts = [];
        foreach ($universalBankers as $universalBanker) {
            $universalBankerAccounts[$universalBanker->id] = 0;
        }

        // Create accounts - one per client
        $accounts = [];
        $now = Carbon::now();

        // Distribute clients evenly among universalBankers, ensuring each universalBanker gets 10 accounts
        $clientsForSeeding = $clients->take(count($universalBankers) * 10); // Limit to exactly what we need
        $universalBankerIndex = 0;
        $currentUniversalBankerId = $universalBankers[$universalBankerIndex]->id;

        foreach ($clientsForSeeding as $index => $client) {
            // If current universalBanker has 10 accounts, move to next universalBanker
            if ($universalBankerAccounts[$currentUniversalBankerId] >= 10) {
                $universalBankerIndex++;
                if ($universalBankerIndex >= count($universalBankers)) {
                    break; // We've assigned all universalBankers their 10 accounts
                }
                $currentUniversalBankerId = $universalBankers[$universalBankerIndex]->id;
            }

            // Determine account type
            $accountProduct = $accountProducts->random();

            // Create account using factory but don't persist yet
            $account = Account::factory()->make([
                'client_id' => $client->id,
                'account_product_id' => $accountProduct->id,
                'universal_banker_id' => $currentUniversalBankerId,
                'opened_at' => $startDate,
            ]);

            // Special account types with more realistic distribution
            $rand = rand(1, 100);
            if ($rand > 95) {
                // 5% chance of high balance account
                $account = Account::factory()->highBalance()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'universal_banker_id' => $currentUniversalBankerId,
                    'opened_at' => $startDate,
                ]);
            } elseif ($rand > 80) {
                // 15% chance of low balance account
                $account = Account::factory()->lowBalance()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'universal_banker_id' => $currentUniversalBankerId,
                    'opened_at' => $startDate,
                ]);
            } elseif ($rand > 75) {
                // 5% chance of USD account
                $account = Account::factory()->usdCurrency()->make([
                    'client_id' => $client->id,
                    'account_product_id' => $accountProduct->id,
                    'universal_banker_id' => $currentUniversalBankerId,
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
                'universal_banker_id' => $account->universal_banker_id,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Increment account count for this universalBanker
            $universalBankerAccounts[$currentUniversalBankerId]++;

            $bar->advance();
        }

        // Bulk insert accounts (much faster than individual inserts)
        DB::table('accounts')->insert($accounts);

        $bar->finish();
        $this->command->newLine(2);
        $this->command->info('Successfully created ' . count($accounts) . ' accounts!');

        // Verify each universalBanker has 10 accounts
        foreach ($universalBankers as $universalBanker) {
            $count = DB::table('accounts')->where('universal_banker_id', $universalBanker->id)->count();
            $this->command->info("UniversalBanker {$universalBanker->name} has {$count} accounts");
        }

        // Now let's create 60 days of account transactions for each account
        $this->command->info('Creating 60 days of account transactions...');
        $accounts = Account::all();

        $bar = $this->command->getOutput()->createProgressBar($accounts->count());
        $bar->start();

        $transactions = [];
        $universalBankerDailyBalances = [];

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

        // Initialize universalBanker balance tracking arrays
        $universalBankerDailyData = [];
        foreach ($universalBankers as $universalBanker) {
            $universalBankerDailyData[$universalBanker->id] = [];

            $currentDay = $startDate->copy();
            while ($currentDay <= $endDate) {
                $dateStr = $currentDay->format('Y-m-d');
                $universalBankerDailyData[$universalBanker->id][$dateStr] = [
                    'total_balance' => 0,
                ];
                $currentDay->addDay();
            }
        }

        foreach ($accounts as $account) {
            // Setup the start balance and date
            $currentDay = $startDate->copy();
            $startBalance = $account->currency === 'IDR' ? rand(1000000, 5000000) : rand(100, 500);
            $balance = $startBalance;

            // Assign some random transaction patterns to this account
            $accountPatterns = [];
            foreach ($transactionPatterns as $key => $pattern) {
                // 50% chance to have each pattern
                if (rand(0, 1)) {
                    $accountPatterns[$key] = $pattern;
                }
            }

            // First transaction is the opening deposit - store current balance
            $transactions[] = [
                'account_id' => $account->id,
                'balance' => $balance,
                'created_at' => $startDate,
                'updated_at' => $startDate,
            ];

            // Update universalBanker daily data for opening day
            $openingDateStr = $startDate->format('Y-m-d');
            $universalBankerDailyData[$account->universal_banker_id][$openingDateStr]['total_balance'] += $balance;

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

                            // Store the new balance
                            $transactions[] = [
                                'account_id' => $account->id,
                                'balance' => $balance,
                                'created_at' => $transactionTime,
                                'updated_at' => $transactionTime,
                            ];

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

                        // Store the new balance
                        $transactions[] = [
                            'account_id' => $account->id,
                            'balance' => $balance,
                            'created_at' => $transactionTime,
                            'updated_at' => $transactionTime,
                        ];

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

                    // Store the new balance
                    $transactions[] = [
                        'account_id' => $account->id,
                        'balance' => $balance,
                        'created_at' => $transactionTime,
                        'updated_at' => $transactionTime,
                    ];

                    $dayTransactionsCount++;
                }

                // Make sure we have at least one transaction per day (even if zero amount)
                if ($dayTransactionsCount === 0) {
                    // Just record the same balance
                    $transactions[] = [
                        'account_id' => $account->id,
                        'balance' => $balance,
                        'created_at' => $currentDay->copy()->setTime(9, 0, 0),
                        'updated_at' => $currentDay->copy()->setTime(9, 0, 0),
                    ];

                    $dayTransactionsCount++;
                }

                // Update universalBanker daily data
                $universalBankerDailyData[$account->universal_banker_id][$dateStr]['total_balance'] += $balance;

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

        // Now create the UniversalBankerDailyBalance records
        $this->command->info('Creating universalBanker daily balance records...');
        $universalBankerBalanceRecords = [];

        foreach ($universalBankerDailyData as $universalBankerId => $dates) {
            foreach ($dates as $date => $data) {
                $universalBankerBalanceRecords[] = [
                    'universal_banker_id' => $universalBankerId,
                    'date' => $date,
                    'total_balance' => $data['total_balance'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert universalBanker daily balance records
        foreach (array_chunk($universalBankerBalanceRecords, 1000) as $chunk) {
            DB::table('universal_banker_daily_balances')->insert($chunk);
        }

        $this->command->info('Successfully created ' . count($universalBankerBalanceRecords) . ' universal_banker daily balance records!');
    }

    /**
     * Get a faker instance
     */
    private function faker(): \Faker\Generator
    {
        return \Faker\Factory::create('id_ID');
    }
}
