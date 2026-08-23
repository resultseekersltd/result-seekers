<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 4 "Placement" — talent-expert.txt names it as a recruitment
     * assignment stage (Priority 2, alongside Assessment/Interview/
     * Reference Check) with no field spec of its own; approved Phase 4
     * scope confirms the shape used here: one placement per pipeline
     * entry, requiring independent Organisation + Professional
     * confirmation before the candidate's outcome can become `Placed`.
     * `engagement_type` stays a free string (no closed taxonomy given),
     * mirroring the existing check_type/interview.type precedent.
     */
    public function up(): void
    {
        Schema::create('placements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')->constrained()->cascadeOnDelete();
            $table->string('engagement_type')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('deployment_location')->nullable();
            $table->text('deployment_notes')->nullable();
            $table->text('onboarding_notes')->nullable();
            $table->string('status')->default('pending_confirmation');
            $table->timestamp('organisation_confirmed_at')->nullable();
            $table->foreignId('organisation_confirmed_by')->nullable()->constrained('organisation_users')->nullOnDelete();
            $table->timestamp('professional_confirmed_at')->nullable();
            $table->foreignId('professional_confirmed_by')->nullable()->constrained('expert_users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('candidate_pipeline_entry_id', 'placements_entry_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placements');
    }
};
