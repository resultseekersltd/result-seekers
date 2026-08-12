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
        Schema::create('strategic_leadership_partners', function (Blueprint $table) {
            $table->id();
            // Explicit short constraint name: the auto-generated one exceeds MySQL's 64-char identifier limit.
            $table->foreignId('strategic_partner_application_id')->nullable();
            $table->foreign('strategic_partner_application_id', 'slp_partner_application_fk')
                ->references('id')->on('strategic_partner_applications')->nullOnDelete();
            $table->string('full_name');
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->boolean('is_published')->default(false);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('strategic_leadership_partners');
    }
};
