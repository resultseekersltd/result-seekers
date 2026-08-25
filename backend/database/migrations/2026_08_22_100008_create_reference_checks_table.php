<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 3 "REFERENCE CHECKING". Referee contact details and
     * verification_notes are private — never released to the organisation
     * (see the existing DataRelease allowlist, which is not extended to
     * include any of these fields). Candidate consent for this specific
     * reference request lives directly on the row (candidate_consented_at
     * / consent_text_version) rather than reusing CandidateConsent —
     * approved Phase 3 judgment call #4: that model requires a non-
     * nullable organisation_id (candidate<->organisation release
     * consent), whereas reference-check consent is candidate<->Result
     * Seekers, a different relationship this model would have to be
     * loosened to accommodate.
     */
    public function up(): void
    {
        Schema::create('reference_checks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')->constrained()->cascadeOnDelete();
            $table->string('referee_name');
            $table->string('referee_relationship')->nullable();
            $table->string('referee_organisation')->nullable();
            $table->string('contact_method')->nullable();
            $table->string('referee_contact')->nullable();
            $table->timestamp('candidate_consented_at')->nullable();
            $table->string('consent_text_version')->nullable();
            $table->string('status')->default('not_started');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_contacted')->nullable();
            $table->string('response_status')->nullable();
            $table->text('verification_notes')->nullable();
            $table->text('risk_flags')->nullable();
            $table->string('final_outcome')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference_checks');
    }
};
