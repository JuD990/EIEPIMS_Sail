<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Students extends Model
{
    use HasApiTokens;
    use HasFactory;

    protected $table = 'students';
    protected $primaryKey = 'id';

    // Mass-assignable attributes
    protected $fillable = [
        'student_id', 
        'firstname', 
        'middlename', 
        'lastname', 
        'password', 
        'email', 
        'department', 
        'year_level', 
        'program', 
        'role',
    ];
}
