<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The request record only — talent-expert.txt's "ORGANISATION TALENT
     * REQUEST" 29-field guided form, condensed to the fields Phase 1's
     * intake actually needs. `reference` is the opaque, human-readable
     * identifier the document asks for ("Generate a unique reference
     * number") — distinct from the internal ULID `id`, and what the
     * organisation-facing UI/API always displays instead of the raw PK.
     * Descriptive/optional detail fields the document lists (department,
     * responsibilities, sector/geographic experience, language
     * requirements, travel requirements, assessment/verification
     * requirements, diversity/inclusion notes, additional information)
     * live in `details` JSON — genuinely flexible per-request content,
     * matching the project's existing convention of JSON only for
     * flexible fields, not a catch-all substitute for real columns.
     * Deliberately stops at the request's own intake lifecycle — the
     * 28-stage recruitment assignment workflow is out of Phase 1 scope
     * (approved Option A).
     */
    public function up(): void
    {
        Schema::create('talent_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organisation_id')->constrained('organisations')->cascadeOnDelete();
            $table->foreignId('organisation_user_id')->nullable()->constrained('organisation_users')->nullOnDelete();
            $table->string('reference')->unique();
            $table->string('service_type');
            $table->string('title');
            $table->unsignedInteger('number_required')->default(1);
            $table->string('location')->nullable();
            $table->string('arrangement')->nullable();
            $table->string('engagement_type')->nullable();
            $table->string('duration')->nullable();
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->text('description');
            $table->text('essential_qualifications')->nullable();
            $table->text('desirable_qualifications')->nullable();
            $table->unsignedInteger('years_experience_required')->nullable();
            $table->json('required_skills')->nullable();
            $table->string('budget_range')->nullable();
            $table->string('confidentiality_level')->default('standard');
            $table->json('details')->nullable();
            $table->string('status')->default('submitted');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('talent_requests');
    }
};
