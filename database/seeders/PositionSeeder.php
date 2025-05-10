<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //

        DB::table('positions')->insert([
            [
                'name' => 'Manager',
                'description' => 'Manager adalah posisi yang bertanggung jawab untuk mengelola tim dan memastikan bahwa semua tugas dan proyek berjalan dengan baik.',
            ],
            [
                'name' => 'Staff',
                'description' => 'Staff adalah posisi yang bertanggung jawab untuk melaksanakan tugas-tugas administratif dan operasional di perusahaan.',
            ],
            [
                'name' => 'Intern',
                'description' => 'Intern adalah posisi magang yang bertujuan untuk memberikan pengalaman kerja kepada mahasiswa atau fresh graduate.',
            ],
        ]);
    }
}
