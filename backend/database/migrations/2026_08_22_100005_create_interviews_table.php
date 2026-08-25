<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 3 "INTERVIEW MANAGEMENT". Owned/created by Result Seekers
     * (Recruiter/Recruitment Manager) — approved Phase 3 judgment call #3:
     * the organisation participates as a panel member and views/feeds
     * back, but does not independently create the record, preserving "RS
     * remains the trusted intermediary."
     */
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->timestamp('scheduled_at')->nullable();
            $table->string('timezone')->nullable();
            $table->string('location_or_link')->nullable();
            $table->string('status')->default('scheduled');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('candidate_confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
