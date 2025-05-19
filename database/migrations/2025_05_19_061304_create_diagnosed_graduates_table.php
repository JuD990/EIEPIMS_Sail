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
        Schema::create('diagnosed_graduates', function (Blueprint $table) {
            $table->id();

            // Personal and Interview Info
            $table->string('name');
            $table->string('student_id');
            $table->date('date_of_interview');
            $table->string('time_of_interview');
            $table->string('venue');
            $table->string('department');
            $table->string('program');
            $table->string('interviewer');
            $table->string('year_level');
            $table->string('show_status')->default("No Show");

            // Pronunciation
            $table->text('consistency_descriptor')->nullable();
            $table->integer('consistency_rating')->nullable();
            $table->text('clarity_descriptor')->nullable();
            $table->integer('clarity_rating')->nullable();
            $table->text('articulation_descriptor')->nullable();
            $table->integer('articulation_rating')->nullable();
            $table->text('intonation_and_stress_descriptor')->nullable();
            $table->integer('intonation_and_stress_rating')->nullable();
            $table->decimal('pronunciation_average', 5, 2)->nullable();

            // Grammar
            $table->text('accuracy_descriptor')->nullable();
            $table->integer('accuracy_rating')->nullable();
            $table->text('clarity_of_thought_descriptor')->nullable();
            $table->integer('clarity_of_thought_rating')->nullable();
            $table->text('syntax_descriptor')->nullable();
            $table->integer('syntax_rating')->nullable();
            $table->decimal('grammar_average', 5, 2)->nullable();

            // Fluency
            $table->text('quality_of_response_descriptor')->nullable();
            $table->integer('quality_of_response_rating')->nullable();
            $table->text('detail_of_response_descriptor')->nullable();
            $table->integer('detail_of_response_rating')->nullable();
            $table->decimal('fluency_average', 5, 2)->nullable();

            // Remarks
            $table->text('pgf_specific_remarks')->nullable();
            $table->text('school_year_highlight')->nullable();
            $table->text('school_year_lowlight')->nullable();
            $table->text('reason_for_enrolling')->nullable();
            $table->text('after_graduation_plans')->nullable();

            // English Language Usage Ratings and Explanations
            $table->integer('transactions_with_employees_rating')->nullable();
            $table->text('transactions_with_employees_explanation')->nullable();

            $table->integer('employee_student_conversations_rating')->nullable();
            $table->text('employee_student_conversations_explanation')->nullable();

            $table->integer('student_visitor_conversations_rating')->nullable();
            $table->text('student_visitor_conversations_explanation')->nullable();

            $table->integer('classes_rating')->nullable();
            $table->text('classes_explanation')->nullable();

            $table->integer('university_activities_rating')->nullable();
            $table->text('university_activities_explanation')->nullable();

            $table->integer('meetings_and_workshops_rating')->nullable();
            $table->text('meetings_and_workshops_explanation')->nullable();

            $table->integer('written_communications_rating')->nullable();
            $table->text('written_communications_explanation')->nullable();

            $table->integer('consultation_sessions_rating')->nullable();
            $table->text('consultation_sessions_explanation')->nullable();

            $table->integer('informal_conversations_rating')->nullable();
            $table->text('informal_conversations_explanation')->nullable();

            $table->integer('external_representation_rating')->nullable();
            $table->text('external_representation_explanation')->nullable();

            $table->integer('native_language_guidance_rating')->nullable();
            $table->text('native_language_guidance_explanation')->nullable();

            $table->integer('clarify_with_native_language_rating')->nullable();
            $table->text('clarify_with_native_language_explanation')->nullable();

            $table->integer('help_restate_context_rating')->nullable();
            $table->text('help_restate_context_explanation')->nullable();

            $table->integer('immersive_program_rating')->nullable();
            $table->text('immersive_program_explanation')->nullable();

            $table->integer('help_correct_english_usage_rating')->nullable();
            $table->text('help_correct_english_usage_explanation')->nullable();

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosed_graduates');
    }
};
