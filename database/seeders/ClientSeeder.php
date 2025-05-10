<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        // Create a regular client
        Client::factory(500)->create();

        // Create a corporate client
        Client::factory()->corporate(40)->create();

        // Create a VIP client who recently joined
        Client::factory()->vip()->recentlyJoined(20)->create();

        // Create 10 long-term regular clients
        Client::factory()->longTerm()->count(10)->create();
    }
}
