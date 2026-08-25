<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One case per expert, tracking overall verification progress toward
     * the VerificationLevel scale. Deliberately separate from
     * ExpertPoolProfileStatus (profile-review lifecycle) — see the
     * readiness report's CRITICAL note. ULID primary key per the approved
     * Phase 1 identifier decision (not a Sanctum tokenable).
     */
    public function up(): void
    {
        Schema::create('verification_cases', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('expert_pool_profile_id')->constrained()->cascadeOnDelete();
            $table->string('target_level')->nullable();
            $table->string('status')->default('not_started');
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_cases');
    }
};
