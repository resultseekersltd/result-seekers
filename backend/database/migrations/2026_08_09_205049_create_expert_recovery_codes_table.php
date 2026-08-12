<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** MFA backup codes — hashed, single-use (see `used_at`). */
    public function up(): void
    {
        Schema::create('expert_recovery_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_user_id')->constrained()->cascadeOnDelete();
            $table->string('code_hash');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_recovery_codes');
    }
};
