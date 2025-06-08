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
        $joinDate = $this->faker->dateTimeBetween('-5 years', 'now');
        $cif = $this->generateCustomCif();

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

    /**
     * Generate custom CIF format based on client name
     * 
     * @param string $name Client name to derive CIF from
     * @return string
     */
    private function generateCustomCif(string $name = null): string
    {
        // Jika nama tidak disediakan, gunakan nama acak
        if ($name === null) {
            $this->faker->locale();
            $name = $this->faker->name();
        }

        // Patterns berdasarkan contoh CIF yang diberikan
        $patterns = [
            // Pattern 1: RLXB439 - RIALDO FAUZIE ANDRIA
            // 4 huruf dari nama + 3 angka
            function ($name) {
                $initials = $this->extractInitialsFromName($name, 4);
                $numbers = $this->faker->numerify('###');
                return $initials . $numbers;
            },

            // Pattern 2: SHPML26 - SHIENNY IRAWATY
            // 5 huruf dari nama + 2 angka
            function ($name) {
                $initials = $this->extractInitialsFromName($name, 5);
                $numbers = $this->faker->numerify('##');
                return $initials . $numbers;
            },

            // Pattern 3: H114781 - HARGIANTO BN HARJOSI
            // 1 huruf dari nama (inisial pertama) + 6 angka
            function ($name) {
                $firstInitial = $this->extractInitialsFromName($name, 1);
                $numbers = $this->faker->numerify('######');
                return $firstInitial . $numbers;
            },

            // Pattern 4: A284203 - ARMUNAH BN ALIMUN
            // 1 huruf dari nama (inisial pertama) + 6 angka
            function ($name) {
                $firstInitial = $this->extractInitialsFromName($name, 1);
                $numbers = $this->faker->numerify('######');
                return $firstInitial . $numbers;
            }
        ];

        // Pilih pola secara acak
        $patternFunction = $this->faker->randomElement($patterns);

        // Generate CIF berdasarkan pola yang dipilih dan nama nasabah
        return $patternFunction($name);
    }

    /**
     * Extract initials or meaningful characters from a name
     * 
     * @param string $name Full name to extract initials from
     * @param int $length Number of characters to extract
     * @return string Extracted initials
     */
    private function extractInitialsFromName(string $name, int $length): string
    {
        $name = strtoupper(trim($name));
        $result = '';
        $words = explode(' ', $name);

        // Strategy 1: Extract first letter of each word
        if (count($words) >= $length) {
            foreach ($words as $word) {
                if (strlen($word) > 0 && strlen($result) < $length) {
                    $result .= substr($word, 0, 1);
                }
            }
        }

        // Strategy 2: Extract first two letters from first name and first letters from other names
        if (strlen($result) < $length) {
            $result = '';
            $firstWord = reset($words);

            if (strlen($firstWord) >= 2) {
                $result .= substr($firstWord, 0, min(3, strlen($firstWord)));
            } elseif (!empty($firstWord)) {
                $result .= $firstWord;
            }

            for ($i = 1; $i < count($words) && strlen($result) < $length; $i++) {
                $word = $words[$i];
                if (strlen($word) > 0) {
                    $result .= substr($word, 0, 1);
                }
            }
        }

        // Strategy 3: Use available characters if we still don't have enough
        if (strlen($result) < $length) {
            $nameWithoutSpaces = str_replace(' ', '', $name);
            $remainingLength = $length - strlen($result);

            if (strlen($nameWithoutSpaces) > strlen($result)) {
                $additionalChars = substr($nameWithoutSpaces, strlen($result), $remainingLength);
                $result .= $additionalChars;
            }
        }

        // Fill with random letters if we still need more characters
        while (strlen($result) < $length) {
            $result .= chr(rand(65, 90)); // Random uppercase letter
        }

        return substr($result, 0, $length);
    }
}
