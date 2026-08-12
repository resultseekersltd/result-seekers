<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deliberately separate from `users` (the admin/staff table — see
     * add_role_to_users_table's own comment) so external professional
     * accounts never share a login surface or query path with internal
     * staff. Shares the existing polymorphic `personal_access_tokens`
     * table for Sanctum bearer tokens — no new tokens table needed.
     */
    public function up(): void
    {
        Schema::create('expert_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('mfa_enabled')->default(false);
            $table->text('mfa_secret')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_users');
    }
};
