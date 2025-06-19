<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            RolePermissionSeeder::class,
            BranchSeeder::class,
            AccountProductSeeder::class,
            UniversalBankerSeeder::class,
            UserSeeder::class,
            ClientSeeder::class,
            AccountSeeder::class,
        ]);
    }
}
