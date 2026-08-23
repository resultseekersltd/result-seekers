<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Section 19: the Organisation should be able to "indicate
     * progression/interest" on a released candidate — a single status
     * field rather than a new entity, since it's one value per release.
     */
    public function up(): void
    {
        Schema::table('data_releases', function (Blueprint $table) {
            $table->string('organisation_status')->nullable()->after('purpose');
        });
    }

    public function down(): void
    {
        Schema::table('data_releases', function (Blueprint $table) {
            $table->dropColumn('organisation_status');
        });
    }
};
