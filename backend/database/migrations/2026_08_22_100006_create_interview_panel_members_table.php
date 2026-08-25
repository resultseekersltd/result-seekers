<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Polymorphic panelist (App\Models\User for RS staff, or
     * App\Models\OrganisationUser for the organisation's own panel
     * participation — talent-expert.txt gives the Organisation
     * Representative role "Schedule interviews... Submit interview
     * feedback"). No new principal/role type introduced — reuses the two
     * existing ones, same nullableMorphs pattern already used by
     * AuditLog's actor_type/actor_id.
     */
    public function up(): void
    {
        Schema::create('interview_panel_members', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('interview_id')->constrained()->cascadeOnDelete();
            $table->morphs('panelist');
            $table->string('role')->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->timestamps();

            $table->unique(['interview_id', 'panelist_type', 'panelist_id'], 'interview_panel_members_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_panel_members');
    }
};
