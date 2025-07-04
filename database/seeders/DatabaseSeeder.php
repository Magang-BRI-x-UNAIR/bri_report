<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
        ]);

        $this->importSqlSequentially();
    }

    private function importSqlSequentially(): void
    {
        $path = storage_path('app/public/sql/import_data.sql');

        if (!File::exists($path)) {
            $this->command->error('Gagal: File tidak ditemukan pada path: ' . $path);
            return;
        }

        try {
            $sql = File::get($path);

            // Pisahkan berdasarkan blok data untuk mempertahankan dependency order
            $blocks = $this->separateDataBlocks($sql);

            foreach ($blocks as $blockName => $blockStatements) {
                $this->command->info("Processing {$blockName}...");

                // Process dalam chunks kecil untuk menghindari memory issues
                $chunks = array_chunk($blockStatements, 100);

                foreach ($chunks as $chunkIndex => $chunk) {
                    $this->command->info("  - Chunk " . ($chunkIndex + 1) . "/" . count($chunks));

                    foreach ($chunk as $statement) {
                        $statement = trim($statement);
                        if (!empty($statement) && !str_starts_with($statement, '--')) {
                            DB::unprepared($statement);
                        }
                    }
                }
            }
            $this->command->info('Sukses: Semua data berhasil diimpor!');
        } catch (\Exception $e) {
            Log::error('Error saat mengimpor SQL: ' . $e->getMessage());
            $this->command->error('Error: ' . $e->getMessage());
        }
    }

    private function separateDataBlocks(string $sql): array
    {
        $lines = explode("\n", $sql);
        $blocks = [];
        $currentBlock = '';
        $currentStatements = [];

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip empty lines dan pure comments
            if (empty($line) || str_starts_with($line, '--')) {
                // Detect block headers
                if (str_contains($line, 'Blok')) {
                    // Save previous block
                    if (!empty($currentBlock) && !empty($currentStatements)) {
                        $blocks[$currentBlock] = $currentStatements;
                    }

                    // Start new block
                    $currentBlock = trim(str_replace(['--', 'Blok', ':'], '', $line));
                    $currentStatements = [];
                }
                continue;
            }

            // Collect SQL statements
            if (!empty($line)) {
                // Handle multi-line statements
                if (str_ends_with($line, ';')) {
                    $currentStatements[] = $line;
                } else {
                    // Multi-line statement - collect until semicolon
                    $statement = $line;
                    // This is a simple approach - you might need more sophisticated parsing
                    $currentStatements[] = $statement;
                }
            }
        }

        // Add last block
        if (!empty($currentBlock) && !empty($currentStatements)) {
            $blocks[$currentBlock] = $currentStatements;
        }

        // If no blocks detected, treat as single block
        if (empty($blocks)) {
            $statements = $this->splitSqlStatements($sql);
            $blocks['All Data'] = $statements;
        }

        return $blocks;
    }

    private function splitSqlStatements(string $sql): array
    {
        $lines = explode("\n", $sql);
        $cleanLines = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line) && !str_starts_with($line, '--')) {
                $cleanLines[] = $line;
            }
        }

        $cleanSql = implode("\n", $cleanLines);
        $statements = [];
        $currentStatement = '';
        $inString = false;
        $stringChar = '';

        for ($i = 0; $i < strlen($cleanSql); $i++) {
            $char = $cleanSql[$i];

            if (!$inString && ($char === '"' || $char === "'")) {
                $inString = true;
                $stringChar = $char;
            } elseif ($inString && $char === $stringChar) {
                if ($i > 0 && $cleanSql[$i - 1] !== '\\') {
                    $inString = false;
                    $stringChar = '';
                }
            }

            $currentStatement .= $char;

            if (!$inString && $char === ';') {
                $statement = trim($currentStatement);
                if (!empty($statement)) {
                    $statements[] = $statement;
                }
                $currentStatement = '';
            }
        }

        if (!empty(trim($currentStatement))) {
            $statements[] = trim($currentStatement);
        }

        return $statements;
    }
}
