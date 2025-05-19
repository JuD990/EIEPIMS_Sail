<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentsToDiagnose extends Model
{
    use HasFactory;

    protected $table = 'students_to_diagnose';

    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'email',
        'student_id',
        'year_level',
        'department',
        'program',
        'pronunciation_average',
        'grammar_average',
        'fluency_average',
        'average_pgf_rating',
        'show_status',
        'pronunciation_average_prev',
        'grammar_average_prev',
        'fluency_average_prev',
        'average_pgf_rating_prev',
        'show_status_prev',
    ];
}
