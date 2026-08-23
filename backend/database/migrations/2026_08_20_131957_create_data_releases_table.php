<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * "Create a controlled candidate-release record showing exactly what
     * was shared, with whom, why, and when" (talent-expert.txt). Schema
     * foundation only — the release *action* (an RS-staff-only mutation
     * gated behind a verified CandidateConsent) is deferred with the rest
     * of the operational consent workflow; this table is what that action
     * will write to once built.
     */
    public function up(): void
    {
        Schema::create('data_releases', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_consent_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('released_to_organisation_id')->constrained('organisations')->cascadeOnDelete();
            $table->foreignId('released_by')->constrained('users')->cascadeOnDelete();
            $table->json('released_fields');
            $table->string('purpose');
            $table->timestamp('released_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_releases');
    }
};
