<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 1 shipped CandidateConsent scoped loosely to organisation_id/
     * talent_request_id (schema foundation only). Phase 2 ties a consent
     * record to the exact opportunity it concerns.
     */
    public function up(): void
    {
        Schema::table('candidate_consents', function (Blueprint $table) {
            $table->foreignUlid('candidate_pipeline_entry_id')->nullable()->after('expert_pool_profile_id')
                ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('candidate_consents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('candidate_pipeline_entry_id');
        });
    }
};
