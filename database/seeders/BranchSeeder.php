<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Branch::create([
            'name' => 'Kantor Pusat',
            'address' => 'Jl. Jendral Sudirman No. 1, Jakarta',
        ]);

        Branch::create([
            'name' => 'Kantor Cabang Jakarta',
            'address' => 'Jl. Jendral Sudirman No. 2, Jakarta',
        ]);

        Branch::create([
            'name' => 'Kantor Cabang Bandung',
            'address' => 'Jl. Asia Afrika No. 3, Bandung',
        ]);

        Branch::create([
            'name' => 'Kantor Cabang Surabaya',
            'address' => 'Jl. Basuki Rahmat No. 4, Surabaya',
        ]);
    }
}
