<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Schema/state foundation only — talent-expert.txt, "CANDIDATE CONSENT
     * AND DATA RELEASE": "Record the consent decision. Record the
     * privacy-policy and consent-text version. Record the date and
     * purpose." The operational request/response workflow (presenting the
     * opportunity, sending the request, recruiter-facing UI) is explicitly
     * deferred — this table exists so the decision, once made, has
     * somewhere durable and auditable to live, and so later phases don't
     * need a schema redesign to add it. History is preserved by never
     * updating a row in place for a new decision — see the model note on
     * why there's no "current consent" mutable field.
     */
    public function up(): void
    {
        Schema::create('candidate_consents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('expert_pool_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('organisation_id')->nullable()->constrained('organisations')->nullOnDelete();
            $table->foreignUlid('talent_request_id')->nullable()->constrained('talent_requests')->nullOnDelete();
            $table->string('purpose');
            $table->string('consent_text_version');
            $table->string('status')->default('requested');
            $table->timestamp('requested_at');
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_consents');
    }
};
