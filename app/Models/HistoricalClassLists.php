<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoricalClassLists extends Model
{
    use HasFactory;

    protected $primaryKey = 'historical_class_lists_id';

    protected $table = 'historical_class_lists';
    public $timestamps = false;
    protected $fillable = [
        'historical_class_lists_id',
        'student_id',
        'firstname',
        'middlename',
        'lastname',
        'email',
        'program',
        'department',
        'year_level',
        'gender',
        'status',
        'classification',
        'reason_for_shift_or_drop',
        'epgf_average',
        'proficiency_level',
        'course_code',
        'course_title',
        'candidate_for_graduating',
        'epgf_rubric_id',
        'task_title',
        'type',
        'comment',
        'semester',
        'school_year',
        'change_note',

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

        'updated_at',
        'created_at',
    ];

    public function implementingSubjectClassLists()
    {
        return $this->hasMany(ImplementingSubjectClassList::class);
    }
}
