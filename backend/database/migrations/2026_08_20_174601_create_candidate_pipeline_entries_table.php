<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * talent-expert.txt §"CANDIDATE PIPELINE" (Phase 2 prompt) / "PIPELINE
     * AND CANDIDATE MANAGEMENT" (source doc). One row per (assignment,
     * candidate) pair — never a status on ExpertPoolProfile — so the same
     * professional can sit in unrelated assignments simultaneously.
     * `stage` is the furthest point reached (source document's own
     * progression, verbatim); `outcome` is a separate nullable field for
     * terminal negatives, so "declined at invitation" doesn't overwrite
     * how far the candidate actually got. Screening and quality-review are
     * single decisions per entry in this phase, not repeatable
     * sub-workflows, so they're columns here rather than their own tables.
     */
    public function up(): void
    {
        Schema::create('candidate_pipeline_entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('recruitment_assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_pool_profile_id')->constrained()->cascadeOnDelete();
            $table->string('stage')->default('identified');
            $table->string('outcome')->nullable();
            $table->text('outcome_reason')->nullable();
            $table->text('recruiter_notes')->nullable();

            // Screening (eligibility/availability/conflict/quality — single recruiter decision per entry).
            $table->string('screening_decision')->nullable();
            $table->text('screening_notes')->nullable();
            $table->foreignId('screened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('screened_at')->nullable();

            // Result Seekers Quality Review, before a shortlist is proposed.
            $table->string('quality_review_decision')->nullable();
            $table->text('quality_review_notes')->nullable();
            $table->foreignId('quality_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('quality_reviewed_at')->nullable();

            $table->foreignId('added_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['recruitment_assignment_id', 'expert_pool_profile_id'], 'pipeline_entries_assignment_profile_unique');
            $table->index(['recruitment_assignment_id', 'stage']);
            $table->index('expert_pool_profile_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_pipeline_entries');
    }
};
