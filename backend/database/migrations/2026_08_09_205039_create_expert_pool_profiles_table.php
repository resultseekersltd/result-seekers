<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The self-managed authenticated profile behind the Expert Pool
     * portal — distinct from the pre-existing `expert_profiles` table,
     * which is an admin-curated public directory entry created from an
     * unauthenticated `expert_applications` submission. That flow and
     * this one are intentionally not merged.
     */
    public function up(): void
    {
        Schema::create('expert_pool_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expert_user_id')->unique()->constrained()->cascadeOnDelete();

            // Personal information
            $table->string('preferred_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('photo_path')->nullable();

            // Professional information
            $table->string('professional_title')->nullable();
            $table->string('current_organization')->nullable();
            $table->unsignedInteger('years_experience')->nullable();
            $table->string('highest_qualification')->nullable();
            $table->string('field_of_study')->nullable();
            $table->text('bio')->nullable();
            $table->json('skills')->nullable();
            $table->json('industries')->nullable();
            $table->json('languages')->nullable();
            $table->json('certifications')->nullable();

            // CV
            $table->string('cv_path')->nullable();
            $table->string('cv_original_name')->nullable();
            $table->timestamp('cv_uploaded_at')->nullable();

            // Workflow
            $table->string('status')->default('incomplete');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_pool_profiles');
    }
};
