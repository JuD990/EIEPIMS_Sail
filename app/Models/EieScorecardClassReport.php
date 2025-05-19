<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EieScorecardClassReport extends Model
{
    use HasFactory;

    protected $table = 'eie_scorecard_class_reports';
    protected $primaryKey = 'scorecard_id';
    protected $fillable = [
        'course_code',
        'epgf_rubric_id',
        'student_id',
        'department',
        'task_title',
        'type',
        'comment',
        'epgf_average',
        'proficiency_level',
        'program',
        'course_title',
        'year_level',
        "change_note",

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
    ];
}
