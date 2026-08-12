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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_category_id')->constrained()->restrictOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('summary');
            $table->longText('content');
            $table->string('author_name');
            $table->string('author_title')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->unsignedInteger('reading_time_minutes')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
