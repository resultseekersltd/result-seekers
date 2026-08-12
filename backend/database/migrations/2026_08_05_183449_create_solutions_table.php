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
        Schema::create('solutions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('summary');
            $table->string('icon')->nullable();
            $table->string('hero_heading')->nullable();
            $table->text('hero_description')->nullable();
            $table->text('problem_statement')->nullable();
            $table->text('our_approach')->nullable();
            $table->json('services')->nullable();
            $table->json('outputs')->nullable();
            $table->json('tools')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solutions');
    }
};
