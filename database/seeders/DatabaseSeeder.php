<?php

namespace Database\Seeders;

use App\Models\Position;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            PositionSeeder::class,
            BranchSeeder::class,
            AccountProductSeeder::class,
            UserSeeder::class,
            ClientSeeder::class,
            AccountSeeder::class,
        ]);
    }
}
