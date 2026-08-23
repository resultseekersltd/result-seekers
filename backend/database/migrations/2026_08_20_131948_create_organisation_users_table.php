<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Field-for-field mirror of expert_users — including the integer
     * auto-increment primary key, which is NOT optional here despite the
     * Phase 1 "new entities get an opaque ID" decision: this table's rows
     * must work as a Sanctum `tokenable`, and personal_access_tokens.
     * tokenable_id is `unsignedBigInteger` (set by Sanctum's own
     * $table->morphs() call in its migration) — a ULID/string primary key
     * would not fit that column without altering the shared token table
     * used by every existing principal type, which the approved Phase 1
     * scope explicitly forbids. See the Phase 1 implementation plan.
     */
    public function up(): void
    {
        Schema::create('organisation_users', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('organisation_id')->constrained('organisations')->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('organisation_representative');
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('mfa_enabled')->default(false);
            $table->text('mfa_secret')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organisation_users');
    }
};
