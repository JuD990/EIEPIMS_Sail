<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiagnosedGraduate extends Model
{
    use HasFactory;

    // Table name (optional if it follows convention)
    protected $table = 'diagnosed_graduates';

    // Mass assignable attributes
    protected $fillable = [
        'name',
        'student_id',
        'date_of_interview',
        'time_of_interview',
        'venue',
        'department',
        'program',
        'interviewer',
        'year_level',

        // Pronunciation
        'consistency_descriptor',
        'consistency_rating',
        'clarity_descriptor',
        'clarity_rating',
        'articulation_descriptor',
        'articulation_rating',
        'intonation_and_stress_descriptor',
        'intonation_and_stress_rating',
        'pronunciation_average',

        // Grammar
        'accuracy_descriptor',
        'accuracy_rating',
        'clarity_of_thought_descriptor',
        'clarity_of_thought_rating',
        'syntax_descriptor',
        'syntax_rating',
        'grammar_average',

        // Fluency
        'quality_of_response_descriptor',
        'quality_of_response_rating',
        'detail_of_response_descriptor',
        'detail_of_response_rating',
        'fluency_average',

        // Remarks
        'pgf_specific_remarks',
        'school_year_highlight',
        'school_year_lowlight',
        'reason_for_enrolling',
        'after_graduation_plans',

        // English Usage Ratings & Explanations
        'transactions_with_employees_rating',
        'transactions_with_employees_explanation',
        'employee_student_conversations_rating',
        'employee_student_conversations_explanation',
        'student_visitor_conversations_rating',
        'student_visitor_conversations_explanation',
        'classes_rating',
        'classes_explanation',
        'university_activities_rating',
        'university_activities_explanation',
        'meetings_and_workshops_rating',
        'meetings_and_workshops_explanation',
        'written_communications_rating',
        'written_communications_explanation',
        'consultation_sessions_rating',
        'consultation_sessions_explanation',
        'informal_conversations_rating',
        'informal_conversations_explanation',
        'external_representation_rating',
        'external_representation_explanation',
        'native_language_guidance_rating',
        'native_language_guidance_explanation',
        'clarify_with_native_language_rating',
        'clarify_with_native_language_explanation',
        'help_restate_context_rating',
        'help_restate_context_explanation',
        'immersive_program_rating',
        'immersive_program_explanation',
        'help_correct_english_usage_rating',
        'help_correct_english_usage_explanation',
    ];
}
