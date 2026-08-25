<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Granular per-check record — talent-expert.txt, "VERIFICATION
     * SYSTEM": "Each check should record: type, subject, status, verifier,
     * date started, date completed, evidence reviewed, method used,
     * internal notes, expiry date, reason for rejection, audit trail."
     * `check_type` is a plain validated string, not a closed DB enum — the
     * document gives named examples (identity, degree, certification,
     * employer, reference, skills_assessment) but not an exhaustive list,
     * and the platform's own stated philosophy elsewhere is that this
     * kind of taxonomy should be extensible without a migration.
     */
    public function up(): void
    {
        Schema::create('verification_checks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('verification_case_id')->constrained()->cascadeOnDelete();
            $table->string('check_type');
            $table->string('subject')->nullable();
            $table->string('status')->default('not_started');
            $table->foreignId('verifier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('evidence_reviewed')->nullable();
            $table->string('method_used')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_checks');
    }
};
