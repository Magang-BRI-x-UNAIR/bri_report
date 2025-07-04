<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportSqlDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $statements;
    protected int $chunkIndex;
    protected int $totalChunks;

    public function __construct(array $statements, int $chunkIndex, int $totalChunks)
    {
        $this->statements = $statements;
        $this->chunkIndex = $chunkIndex;
        $this->totalChunks = $totalChunks;
    }

    public function handle(): void
    {
        try {
            DB::beginTransaction();

            foreach ($this->statements as $statement) {
                $statement = trim($statement);
                if (!empty($statement) && !str_starts_with($statement, '--')) {
                    DB::unprepared($statement);
                }
            }

            DB::commit();

            Log::info("SQL Import chunk {$this->chunkIndex}/{$this->totalChunks} completed successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("SQL Import chunk {$this->chunkIndex} failed: " . $e->getMessage());
            throw $e;
        }
    }
}
