<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Section 15 "OPPORTUNITY INVITATION". If exact expiry duration isn't
     * specified by the source documents (it isn't), `expires_at` is left
     * nullable/configurable per-invitation rather than a hardcoded fixed
     * duration — see the controller for where this is set.
     */
    public function up(): void
    {
        Schema::create('opportunity_invitations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('candidate_pipeline_entry_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('decline_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_invitations');
    }
};
