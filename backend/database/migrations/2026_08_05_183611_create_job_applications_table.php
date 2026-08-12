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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            // Nullable: the Careers "Future Opportunities" path accepts
            // speculative applications with no specific vacancy attached.
            $table->foreignId('vacancy_id')->nullable()->constrained()->nullOnDelete();
            $table->string('applicant_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('cv_path');
            $table->string('cover_letter_path')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('status')->default('new');
            $table->text('internal_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
