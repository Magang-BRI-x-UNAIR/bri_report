<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            AccountProductSeeder::class,
            RolePermissionSeeder::class,
            BranchSeeder::class,
            UniversalBankerSeeder::class,
            UserSeeder::class,
            ClientSeeder::class,
            AccountSeeder::class,

        ]);
        $path = storage_path('app/public/sql/import_data.sql');
        try {
            if (File::exists($path)) {
                $sql = File::get($path);
                DB::unprepared($sql);
                $this->command->info('Sukses: File import_data.sql dari storage/public berhasil diimpor!');
            } else {
                $this->command->error('Gagal: File tidak ditemukan pada path: ' . $path);
            }
        } catch (\Exception $e) {
            $this->command->error('Terjadi error saat mengimpor SQL: ' . $e->getMessage());
        }
    }
}
