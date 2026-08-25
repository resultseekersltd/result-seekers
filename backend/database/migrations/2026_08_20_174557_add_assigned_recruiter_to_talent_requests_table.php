<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Section 6 "RECRUITER ASSIGNMENT" — who is handling request intake. */
    public function up(): void
    {
        Schema::table('talent_requests', function (Blueprint $table) {
            $table->foreignId('assigned_recruiter_id')->nullable()->after('organisation_user_id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('talent_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_recruiter_id');
        });
    }
};
