<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fields per talent-expert.txt, "ORGANISATION REGISTRATION AND
     * VERIFICATION". ULID primary key (Phase 1 approved identifier
     * decision — new entities get an opaque ID; this one isn't a Sanctum
     * tokenable, so no compatibility constraint applies, unlike
     * organisation_users).
     */
    public function up(): void
    {
        Schema::create('organisations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('legal_name')->nullable();
            $table->string('trading_name')->nullable();
            $table->string('organisation_type')->nullable();
            $table->string('sector')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->text('registered_address')->nullable();
            $table->string('website')->nullable();
            $table->string('official_email_domain')->nullable();
            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_position')->nullable();
            $table->string('contact_person_phone')->nullable();
            $table->string('registration_number')->nullable();
            $table->text('tax_regulatory_info')->nullable();
            $table->text('profile_description')->nullable();
            $table->text('recruitment_needs')->nullable();
            $table->boolean('terms_agreed')->default(false);
            $table->timestamp('terms_agreed_at')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organisations');
    }
};
