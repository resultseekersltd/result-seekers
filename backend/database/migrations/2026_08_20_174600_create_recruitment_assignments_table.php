<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The recruitment campaign itself — talent-expert.txt's "RECRUITMENT
     * ASSIGNMENT WORKFLOW", assignment-level terms only ("Assignment
     * opened" / "completed" / "cancelled" / "archived"; the stages in
     * between belong to CandidatePipelineEntry, not this table).
     * organisation_id is denormalized from talent_request for fast
     * tenant-scoped queries without a join. ULID per the Phase 1 decision.
     */
    public function up(): void
    {
        Schema::create('recruitment_assignments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('talent_request_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('organisation_id')->constrained('organisations')->cascadeOnDelete();
            $table->foreignId('recruiter_id')->constrained('users')->restrictOnDelete();
            $table->string('reference')->unique();
            $table->string('status')->default('opened');
            $table->timestamp('opened_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['organisation_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitment_assignments');
    }
};
