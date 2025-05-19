<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DummyUserSeeder extends Seeder
{
    public function run()
    {
        // ================= Student Role =================
 /*       $students = [
            [
                'student_id' => 'STU001',
                'firstname' => 'Christine Joy',
                'middlename' => '',
                'lastname' => 'Cleofe',
                'password' => Hash::make('password123'),
                'email' => 'christinejoy.cleofe@unc.edu.ph',
                'department' => 'SCIS',
                'year_level' => '4th Year',
                'program' => 'BSIT',
                'role' => 'Student',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 'STU002',
                'firstname' => 'Camille',
                'middlename' => '',
                'lastname' => 'Abang',
                'password' => Hash::make('password123'),
                'email' => 'camille.abang@unc.edu.ph',
                'department' => 'SCIS',
                'year_level' => '4th Year',
                'program' => 'BSIT',
                'role' => 'Student',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'student_id' => 'STU003',
                'firstname' => 'Jude Christian',
                'middlename' => 'V.',
                'lastname' => 'Adolfo',
                'password' => Hash::make('password123'),
                'email' => 'judechristian.adolfo@unc.edu.ph',
                'department' => 'SCIS',
                'year_level' => '4th Year',
                'program' => 'BSIT',
                'role' => 'Student',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('students')->insert($students);
*/
        // ================= EIE Head Role =================
        $eie_heads = [
            [
                'employee_id' => 'EIEHEAD001',
                'firstname' => 'Agnes',
                'middlename' => 'T.',
                'lastname' => 'Reyes',
                'password' => Hash::make('password123'),
                'email' => 'agnes.reyes@unc.edu.ph',
                'department' => 'SCIS',
                'full_department' => 'School of Computer and Information Sciences',
                'role' => 'EIE Head',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => 'EIEHEAD002',
                'firstname' => 'Lorlie',
                'middlename' => 'B.',
                'lastname' => 'Tanjay',
                'password' => Hash::make('password123'),
                'email' => 'lorlie.tanjay@unc.edu.ph',
                'department' => 'CJE',
                'full_department' => 'College of Criminal Justice Education',
                'role' => 'EIE Head',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('eie_heads')->insert($eie_heads);

        // ================= ESL Admins Role =================
        $esl_admins = [
            [
                'employee_id' => 'ESLPRIME001',
                'firstname' => 'Chin',
                'middlename' => '',
                'lastname' => 'Borela',
                'password' => Hash::make('password123'),
                'email' => 'eslprime@unc.edu.ph',
                'role' => 'ESL Prime',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'employee_id' => 'ESLCHAMP001',
                'firstname' => 'Mia',
                'middlename' => '',
                'lastname' => 'Tijam',
                'password' => Hash::make('password123'),
                'email' => 'eslchampion@unc.edu.ph',
                'role' => 'ESL Champion',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('esl_admins')->insert($esl_admins);

        // ================= Lead POC Role =================
        $lead_pocs = [
            [
                'employee_id' => 'LEADPOC001',
                'firstname' => 'June',
                'middlename' => '',
                'lastname' => 'Danila',
                'password' => Hash::make('password123'),
                'email' => 'leadpoc@unc.edu.ph',
                'department' => 'SCIS',
                'program' => 'BSCS',
                'role' => 'Lead POC',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('lead_pocs')->insert($lead_pocs);
    }
}
