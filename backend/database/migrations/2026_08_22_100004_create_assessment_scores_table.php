<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Structured, explainable scoring (talent-expert.txt's matching-engine
     * principle applied here too — "never an opaque AI score"). One score
     * per submission, always entered by a named human reviewer.
     */
    public function up(): void
    {
        Schema::create('assessment_scores', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('assessment_submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->restrictOnDelete();
            $table->decimal('score', 6, 2);
            $table->decimal('max_score', 6, 2);
            $table->json('criteria_breakdown')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_scores');
    }
};
