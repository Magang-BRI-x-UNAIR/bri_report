<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UniversalBanker;

class UniversalBankerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        UniversalBanker::factory(10)->create();
    }
}
