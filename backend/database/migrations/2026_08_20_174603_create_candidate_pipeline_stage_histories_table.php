<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * talent-expert.txt's DATA MODEL section names "CandidateStageHistory"
     * explicitly as its own entity, distinct from the generic audit log —
     * an immutable, append-only record of every stage transition. Rows
     * are never updated or deleted.
     */
    public function up(): void
    {
        Schema::create('candidate_pipeline_stage_histories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')
                ->constrained(indexName: 'pipeline_stage_histories_entry_id_foreign')
                ->cascadeOnDelete();
            $table->string('from_stage')->nullable();
            $table->string('to_stage');
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_pipeline_stage_histories');
    }
};
