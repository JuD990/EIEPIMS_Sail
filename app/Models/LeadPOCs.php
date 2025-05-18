<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class LeadPOCs extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;

    protected $table = 'lead_pocs';
    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'firstname',
        'middlename',
        'lastname',
        'password',
        'email',
        'department',
        'program',
        'role',
    ];
}
