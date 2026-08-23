<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only trail of admin actions. `actor_name`/`subject_label` are
     * denormalized snapshots so a log entry stays readable even if the
     * actor or subject is later deleted. Deliberately not a package (see
     * Task 014 report) — this project's audit needs are simple enough for
     * a small custom table + a shared logging helper.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('actor');
            $table->string('actor_name')->nullable();
            $table->string('action');
            $table->nullableMorphs('subject');
            $table->string('subject_label')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
