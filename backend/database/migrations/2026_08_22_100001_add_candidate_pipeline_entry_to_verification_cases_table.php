<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 3: ties a verification case to the recruitment assignment it
     * was opened for, when applicable — mirrors the exact pattern Phase 2
     * used for candidate_consents. Nullable because a case can still be
     * opened against a profile before any assignment exists (Phase 0/1's
     * original standalone use), which must keep working unchanged.
     */
    public function up(): void
    {
        Schema::table('verification_cases', function (Blueprint $table) {
            $table->foreignUlid('candidate_pipeline_entry_id')->nullable()->after('expert_pool_profile_id')
                ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('verification_cases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('candidate_pipeline_entry_id');
        });
    }
};
