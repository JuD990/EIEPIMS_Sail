<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassLists extends Model
{
    use HasFactory;

    protected $primaryKey = 'class_lists_id';

    protected $table = 'class_lists';

    protected $fillable = [
        'class_lists_id',
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
        'semester',
        'school_year',
        'epgf_average',
        'proficiency_level',
        'course_code',
        'course_title',
        'candidate_for_graduating',
        'epgf_rubric_id',
        'task_title',
        'type',
        'comment',
        'change_note',
        'pronunciation_average',
        'grammar_average',
        'fluency_average',
    ];
}
