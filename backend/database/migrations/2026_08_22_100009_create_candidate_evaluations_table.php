<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 3 "ORGANISATION EVALUATION" — a structured score/recommendation
     * on top of the existing DataRelease (status + comments already
     * shipped in Phase 2). Multiple rows per release are allowed
     * ("candidate comparison where supported" — talent-expert.txt gives
     * multiple organisation users the ability to score independently).
     * `final_outcome` is a plain reporting data point ("Record hiring
     * decisions" per the Organisation Representative role) — this is not
     * an offer/contract/placement workflow, which stays out of scope.
     */
    public function up(): void
    {
        Schema::create('candidate_evaluations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('data_release_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organisation_user_id')->constrained()->cascadeOnDelete();
            $table->decimal('score', 4, 2)->nullable();
            $table->text('criteria_notes')->nullable();
            $table->string('recommendation')->nullable();
            $table->string('final_outcome')->nullable();
            $table->timestamps();

            $table->unique(['data_release_id', 'organisation_user_id'], 'candidate_evaluations_release_org_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_evaluations');
    }
};
