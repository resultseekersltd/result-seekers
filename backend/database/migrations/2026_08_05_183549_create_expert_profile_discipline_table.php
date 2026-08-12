<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expert_profile_discipline', function (Blueprint $table) {
            $table->foreignId('expert_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_discipline_id')->constrained()->cascadeOnDelete();
            $table->primary(['expert_profile_id', 'expert_discipline_id'], 'epd_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_profile_discipline');
    }
};
