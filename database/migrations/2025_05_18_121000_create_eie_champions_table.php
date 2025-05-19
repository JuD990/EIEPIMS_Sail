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
        Schema::create('eie_champions', function (Blueprint $table) {
            $table->id("eie_champions_id");
            $table->string('student_id');
            $table->string('firstname', 50);
            $table->string('middlename', 50)->nullable();
            $table->string('lastname', 50);
            $table->string('email', 50);
            $table->string('department', 50);
            $table->string('year_level');
            $table->string('program');
            $table->string('semester')->nullable();
            $table->string('gender')->nullable();
            $table->integer('times_won')->nullable();
            $table->decimal('epgf_average', 5, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eie_champions');
    }
};
