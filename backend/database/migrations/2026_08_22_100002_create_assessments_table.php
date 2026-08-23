<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 3 "ASSESSMENTS" (talent-expert.txt). One row is one assessment
     * assigned to one candidate for one recruitment assignment — the
     * candidate's actual answer lives in AssessmentSubmission, and the
     * reviewer's score lives in AssessmentScore, deliberately not folded
     * into this row (different actors, different audiences, different
     * timing — collapsing them would overload one status field, exactly
     * what the Phase 3 brief says not to do). Scope is deliberately not a
     * full MCQ question bank (no AssessmentQuestion table) — approved
     * Phase 3 judgment call #1.
     */
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->unsignedInteger('time_limit_minutes')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('closes_at')->nullable();
            $table->unsignedInteger('attempt_limit')->nullable();
            $table->json('scoring_rules')->nullable();
            $table->string('status')->default('assigned');
            $table->boolean('result_visible_to_candidate')->default(false);
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
