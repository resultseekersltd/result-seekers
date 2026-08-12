<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Pivot to the existing `expert_disciplines` taxonomy — no new categories table. */
    public function up(): void
    {
        Schema::create('expert_pool_profile_discipline', function (Blueprint $table) {
            $table->foreignId('expert_pool_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_discipline_id')->constrained()->cascadeOnDelete();
            $table->primary(['expert_pool_profile_id', 'expert_discipline_id'], 'eppd_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_pool_profile_discipline');
    }
};
