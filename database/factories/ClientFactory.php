<?php


namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate a realistic CIF (Customer Information File) number
        // Format: BRI-YYYYMM-XXXXX where XXXXX is a random number
        $joinDate = $this->faker->dateTimeBetween('-5 years', 'now');
        $joinYear = Carbon::parse($joinDate)->format('Y');
        $joinMonth = Carbon::parse($joinDate)->format('m');
        $randomNumber = str_pad($this->faker->unique()->numberBetween(10000, 99999), 5, '0', STR_PAD_LEFT);
        $cif = "BRI-{$joinYear}{$joinMonth}-{$randomNumber}";

        // Generate client name - using Indonesian locale for more realistic names
        $this->faker->locale();
        $name = $this->faker->name();

        // Generate email based on the name
        $emailName = strtolower(str_replace(' ', '.', $name));
        $email = $emailName . '@' . $this->faker->randomElement(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']);

        // Generate Indonesian format mobile number
        $phoneNumber = '+62' . $this->faker->numberBetween(8, 8) . $this->faker->randomNumber(8, true);

        return [
            'cif' => $cif,
            'name' => $name,
            'email' => $email,
            'phone' => $phoneNumber,
            'joined_at' => $joinDate,
        ];
    }

    /**
     * Indicate that the client is a corporate client.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function corporate()
    {
        return $this->state(function (array $attributes) {
            // Generate corporate name
            $companyName = $this->faker->randomElement(['PT', 'CV', 'Yayasan']) . ' ' .
                $this->faker->company();

            // Corporate email domain
            $companyDomain = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $companyName)) . '.co.id';
            $email = 'info@' . $companyDomain;

            return [
                'name' => $companyName,
                'email' => $email,
                'cif' => 'BRI-CORP-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            ];
        });
    }

    /**
     * Indicate that the client is a VIP client.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function vip()
    {
        return $this->state(function (array $attributes) {
            return [
                'cif' => 'BRI-VIP-' . str_pad($this->faker->unique()->numberBetween(1, 9999), 5, '0', STR_PAD_LEFT),
            ];
        });
    }

    /**
     * Indicate that the client recently joined.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function recentlyJoined()
    {
        return $this->state(function (array $attributes) {
            $recentDate = $this->faker->dateTimeBetween('-3 months', 'now');

            return [
                'joined_at' => $recentDate,
            ];
        });
    }

    /**
     * Indicate that the client is a long-term client.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function longTerm()
    {
        return $this->state(function (array $attributes) {
            $oldDate = $this->faker->dateTimeBetween('-10 years', '-5 years');

            return [
                'joined_at' => $oldDate,
            ];
        });
    }
}
