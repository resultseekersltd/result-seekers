<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 4: closes the Phase 3 "assessment file submission isn't wired
     * to real storage" gap. The stored path itself is always a randomised
     * UUID (see AssessmentController::submit()) — this column exists only
     * so a legitimate downloader (the candidate themself, or the owning
     * reviewer) gets back a sensible filename, exactly mirroring
     * ExpertPoolProfile::cv_original_name's existing pattern.
     */
    public function up(): void
    {
        Schema::table('assessment_submissions', function (Blueprint $table) {
            $table->string('file_original_name')->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('assessment_submissions', function (Blueprint $table) {
            $table->dropColumn('file_original_name');
        });
    }
};
