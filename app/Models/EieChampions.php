<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EieChampions extends Model
{
    use HasFactory;

    protected $table = 'eie_champions';

    protected $primaryKey = 'eie_champions_id';

    protected $fillable = [
        'student_id',
        'firstname',
        'middlename',
        'lastname',
        'email',
        'department',
        'year_level',
        'program',
        'gender',
        'times_won',
        "semester",
        "epgf_average",
    ];
}
