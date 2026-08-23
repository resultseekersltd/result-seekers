<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The candidate's own response — separate from Assessment (the
     * definition) so "attempt limits" (talent-expert.txt) is representable
     * as multiple rows rather than overwritten state.
     */
    public function up(): void
    {
        Schema::create('assessment_submissions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('assessment_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->text('response_text')->nullable();
            $table->string('file_path')->nullable();
            $table->json('answers')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['assessment_id', 'attempt_number'], 'assessment_submissions_attempt_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_submissions');
    }
};
