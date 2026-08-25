<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Purely additive. `visibility_status` defaults to 'private' — no
     * existing profile becomes discoverable by an act of migration, an
     * expert must actively opt in. `verification_level` is a denormalized
     * cache of the highest confirmed VerificationCheck outcome (see that
     * migration + the VerificationLevel enum) so recruiter search can
     * filter by level without joining the verification ledger on every
     * query; it starts at 'registered' for every existing profile, which
     * is accurate — nothing has been verified under the new system yet.
     */
    public function up(): void
    {
        Schema::table('expert_pool_profiles', function (Blueprint $table) {
            $table->string('visibility_status')->default('private')->after('status');
            $table->string('verification_level')->default('registered')->after('visibility_status');
        });
    }

    public function down(): void
    {
        Schema::table('expert_pool_profiles', function (Blueprint $table) {
            $table->dropColumn(['visibility_status', 'verification_level']);
        });
    }
};
