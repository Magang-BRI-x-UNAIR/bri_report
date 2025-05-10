<?php

namespace Database\Seeders;

use App\Models\AccountProduct;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        AccountProduct::create([
            'code' => 'BM',
            'name' => 'Britama Khusus',
            'description' => 'Britama Khusus adalah produk tabungan yang ditujukan untuk nasabah yang ingin menyimpan dana dalam jangka waktu tertentu dengan bunga yang lebih tinggi dibandingkan tabungan biasa.',
        ]);

        AccountProduct::create([
            'code' => 'VM',
            'name' => 'Britama Bisnis',
            'description' => 'Britama Bisnis adalah produk tabungan yang ditujukan untuk nasabah yang memiliki usaha atau bisnis dan ingin menyimpan dana dalam jangka waktu tertentu dengan bunga yang lebih tinggi dibandingkan tabungan biasa.',
        ]);
    }
}
