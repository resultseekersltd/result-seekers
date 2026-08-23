<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One private scorecard per panelist. "Do not expose one panel
     * member's private scoring to another before submission" (talent-
     * expert.txt) — approved Phase 3 judgment call #2: a panelist always
     * sees their own row; sees others' only once the parent Interview is
     * `completed` (enforced in InterviewScorecardPolicy, not here).
     */
    public function up(): void
    {
        Schema::create('interview_scorecards', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('interview_id')->constrained()->cascadeOnDelete();
            $table->morphs('panelist');
            $table->json('competency_scores')->nullable();
            $table->text('panel_comments')->nullable();
            $table->string('overall_recommendation')->nullable();
            $table->boolean('conflict_of_interest')->default(false);
            $table->text('conflict_of_interest_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['interview_id', 'panelist_type', 'panelist_id'], 'interview_scorecards_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_scorecards');
    }
};
