<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * talent-expert.txt: Organisation Representatives can "Add private
     * internal comments" on candidates. Scoped to a specific DataRelease
     * (never a live ExpertPoolProfile reference) — an organisation can
     * only comment on a candidate that was actually released to it, and
     * the FK chain enforces that at the schema level.
     */
    public function up(): void
    {
        Schema::create('organisation_candidate_comments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('data_release_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organisation_user_id')->constrained()->cascadeOnDelete();
            $table->text('comment');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organisation_candidate_comments');
    }
};
