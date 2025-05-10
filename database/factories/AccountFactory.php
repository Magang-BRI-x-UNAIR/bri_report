<?php

namespace Database\Factories;


use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate bank account number with BRI format (15 digits)
        $prefix = "4";  // BRI account number typically starts with 4
        $randomPart = $this->faker->numerify('##############');
        $accountNumber = $prefix . $randomPart;

        // Generate reasonable balances 
        $currentBalance = $this->faker->numberBetween(50000, 50000000); // Between 50K and 50M
        $availableBalance = $currentBalance * $this->faker->randomFloat(2, 0.95, 1); // Slightly less or equal to current balance

        // Default to IDR currency since we're in Indonesia
        $currency = 'IDR';

        // Account statuses with weighted probabilities
        $statuses = ['active', 'active', 'active', 'active', 'inactive', 'blocked'];
        $status = $this->faker->randomElement($statuses);

        // Create random opened_at date within the last 5 years
        $openedAt = $this->faker->dateTimeBetween('-5 years', '-1 day');

        // Get existing client IDs - we'll use the seeder to assign these
        // rather than creating new clients

        return [
            'account_number' => $accountNumber,
            'current_balance' => $currentBalance,
            'available_balance' => $availableBalance,
            'currency' => $currency,
            'status' => $status,
            'opened_at' => $openedAt,
            // client_id will be assigned in the seeder
            // account_product_id will be assigned in the seeder
            // teller_id will be assigned in the seeder
        ];
    }

    /**
     * Indicate that the account has a high balance.
     */
    public function highBalance()
    {
        return $this->state(function (array $attributes) {
            $highBalance = $this->faker->numberBetween(100000000, 1000000000); // 100M to 1B
            return [
                'current_balance' => $highBalance,
                'available_balance' => $highBalance * $this->faker->randomFloat(2, 0.98, 1),
            ];
        });
    }

    /**
     * Indicate that the account has a low balance.
     */
    public function lowBalance()
    {
        return $this->state(function (array $attributes) {
            $lowBalance = $this->faker->numberBetween(10000, 100000); // 10K to 100K
            return [
                'current_balance' => $lowBalance,
                'available_balance' => $lowBalance,
            ];
        });
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'inactive',
            ];
        });
    }

    /**
     * Indicate that the account is blocked.
     */
    public function blocked()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'blocked',
            ];
        });
    }

    /**
     * Indicate that the account is newly opened.
     */
    public function newAccount()
    {
        return $this->state(function (array $attributes) {
            return [
                'opened_at' => $this->faker->dateTimeBetween('-3 months', '-1 day'),
            ];
        });
    }

    /**
     * Indicate that the account is in USD currency.
     */
    public function usdCurrency()
    {
        return $this->state(function (array $attributes) {
            // USD balances are typically lower when expressed in USD
            $usdBalance = $this->faker->numberBetween(100, 10000);
            return [
                'currency' => 'USD',
                'current_balance' => $usdBalance,
                'available_balance' => $usdBalance * $this->faker->randomFloat(2, 0.95, 1),
            ];
        });
    }
}
