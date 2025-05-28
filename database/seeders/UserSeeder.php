<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::factory()->universalBanker()->count(5)->create();

        $super_admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'super.admin@bri.co.id',
            'password' => bcrypt('password'),
            'phone' => '081234567890',
            'address' => 'Jl. Super Admin No. 1',
        ]);
        $super_admin->assignRole('super_admin');
    }
}
