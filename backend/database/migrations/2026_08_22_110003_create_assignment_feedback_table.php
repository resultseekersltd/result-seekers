<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 4 "AssignmentFeedback" — "Collect post-placement feedback"
     * (Recruiter capability, talent-expert.txt) plus the "candidate
     * satisfaction" / "client satisfaction" dashboard metrics, which the
     * approved Phase 4 scope resolves as symmetric feedback. `submitter`
     * is polymorphic (App\Models\OrganisationUser or App\Models\ExpertUser)
     * — same nullableMorphs-style pattern already used by
     * InterviewPanelMember/InterviewScorecard, no new principal type.
     * One row per submitter per placement — resubmission updates the same
     * row (see AssignmentFeedbackController), never creates a duplicate.
     */
    public function up(): void
    {
        Schema::create('assignment_feedback', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('placement_id')->constrained()->cascadeOnDelete();
            $table->morphs('submitter');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['placement_id', 'submitter_type', 'submitter_id'], 'assignment_feedback_submitter_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_feedback');
    }
};
