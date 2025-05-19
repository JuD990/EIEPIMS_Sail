<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * use Illuminate\Database\Migrations\Migration;
     * use Illuminate\Database\Schema\Blueprint;
     * use Illuminate\Support\Facades\Schema;
     *
     * return new class extends Migration
     * {
     *    /**
     * Run the migrations.
     */
     public function up(): void
     {
         Schema::create('eie_scorecard_class_reports', function (Blueprint $table) {
             $table->id('scorecard_id');
             $table->string('course_code', 100);
             $table->integer('epgf_rubric_id');
             $table->string('student_id', 50);
             $table->string('department', 100);
             $table->string('task_title');
             $table->string('type');
             $table->string('comment')->default('No Comment');
             $table->decimal('epgf_average', 5, 2);
             $table->string('proficiency_level');
             $table->string('program');
             $table->string('course_title');
             $table->string('year_level');
             $table->string('change_note')->nullable();

             // Pronunciation
             $table->text('consistency_descriptor');
             $table->decimal('consistency_rating', 5, 2);
             $table->text('clarity_descriptor');
             $table->decimal('clarity_rating', 5, 2);
             $table->text('articulation_descriptor');
             $table->decimal('articulation_rating', 5, 2);
             $table->text('intonation_and_stress_descriptor');
             $table->decimal('intonation_and_stress_rating', 5, 2);
             $table->decimal('pronunciation_average', 5, 2);

             // Grammar
             $table->text('accuracy_descriptor');
             $table->decimal('accuracy_rating', 5, 2);
             $table->text('clarity_of_thought_descriptor');
             $table->decimal('clarity_of_thought_rating', 5, 2);
             $table->text('syntax_descriptor');
             $table->decimal('syntax_rating', 5, 2);
             $table->decimal('grammar_average', 5, 2);

             // Fluency
             $table->text('quality_of_response_descriptor');
             $table->decimal('quality_of_response_rating', 5, 2);
             $table->text('detail_of_response_descriptor');
             $table->decimal('detail_of_response_rating', 5, 2);
             $table->decimal('fluency_average', 5, 2);

             $table->timestamps();
         });
     }

     /**
      * Reverse the migrations.
      */
     public function down(): void
     {
         Schema::dropIfExists('eie_scorecard_class_reports');
     }
};

