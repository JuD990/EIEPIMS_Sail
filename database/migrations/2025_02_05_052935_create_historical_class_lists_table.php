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
        Schema::create('historical_class_lists', function (Blueprint $table) {
            $table->id('historical_class_lists_id');
            $table->string('student_id');
            $table->string('firstname');
            $table->string('middlename')->nullable();
            $table->string('lastname');
            $table->string('email');
            $table->string('program');
            $table->string('department');
            $table->string('year_level')->nullable();
            $table->string('gender')->nullable();
            $table->string('status')->default('Active');
            $table->string('classification')->nullable();
            $table->string('reason_for_shift_or_drop', 255)->nullable();
            $table->string('semester')->nullable();
            $table->string('school_year')->nullable();
            $table->decimal('epgf_average', 5, 2)->nullable()->default(0.00);
            $table->string('proficiency_level', 50)->nullable();
            $table->string('course_code')->nullable();
            $table->string('course_title')->nullable();
            $table->string('candidate_for_graduating')->default("No");
            $table->string('epgf_rubric_id')->nullable();
            $table->string('task_title')->nullable();
            $table->string('type')->nullable();
            $table->text('comment')->nullable();
            $table->string('change_note')->nullable();

            // Pronunciation details
            $table->text('consistency_descriptor')->nullable();
            $table->decimal('consistency_rating', 5, 2)->nullable();
            $table->text('clarity_descriptor')->nullable();
            $table->decimal('clarity_rating', 5, 2)->nullable();
            $table->text('articulation_descriptor')->nullable();
            $table->decimal('articulation_rating', 5, 2)->nullable();
            $table->text('intonation_and_stress_descriptor')->nullable();
            $table->decimal('intonation_and_stress_rating', 5, 2)->nullable();
            $table->decimal('pronunciation_average', 5, 2)->nullable();

            // Grammar details
            $table->text('accuracy_descriptor')->nullable();
            $table->decimal('accuracy_rating', 5, 2)->nullable();
            $table->text('clarity_of_thought_descriptor')->nullable();
            $table->decimal('clarity_of_thought_rating', 5, 2)->nullable();
            $table->text('syntax_descriptor')->nullable();
            $table->decimal('syntax_rating', 5, 2)->nullable();
            $table->decimal('grammar_average', 5, 2)->nullable();

            // Fluency details
            $table->text('quality_of_response_descriptor')->nullable();
            $table->decimal('quality_of_response_rating', 5, 2)->nullable();
            $table->text('detail_of_response_descriptor')->nullable();
            $table->decimal('detail_of_response_rating', 5, 2)->nullable();
            $table->decimal('fluency_average', 5, 2)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historical_class_lists');
    }
};
