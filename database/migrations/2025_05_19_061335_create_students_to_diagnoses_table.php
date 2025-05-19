<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('students_to_diagnose', function (Blueprint $table) {
            $table->id();
            $table->string('firstname');
            $table->string('middlename')->nullable();
            $table->string('lastname');
            $table->string('email')->unique();
            $table->string('student_id')->unique();
            $table->string('year_level');
            $table->string('department');
            $table->string('program');
            $table->float('pronunciation_average')->nullable();
            $table->float('grammar_average')->nullable();
            $table->float('fluency_average')->nullable();
            $table->float('average_pgf_rating')->nullable();
            $table->string('show_status')->default("No Show");
            $table->float('pronunciation_average_prev')->nullable();
            $table->float('grammar_average_prev')->nullable();
            $table->float('fluency_average_prev')->nullable();
            $table->float('average_pgf_rating_prev')->nullable();
            $table->string('show_status_prev')->default("No Show");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students_to_diagnose');
    }
};
