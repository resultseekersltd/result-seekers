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
        Schema::create('expert_application_discipline', function (Blueprint $table) {
            $table->foreignId('expert_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_discipline_id')->constrained()->cascadeOnDelete();
            $table->primary(['expert_application_id', 'expert_discipline_id'], 'ead_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_application_discipline');
    }
};
