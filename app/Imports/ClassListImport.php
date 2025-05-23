<?php

namespace App\Imports;

use App\Models\ClassLists;
use App\Models\Students;
use App\Models\MasterClassList;
use App\Models\StudentsToDiagnose;
use App\Models\HistoricalClassLists;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClassListImport implements ToModel, WithHeadingRow
{
    protected $year;
    protected $semester;
    protected $semesterMonths;
    protected $failedImports = [];

    public function __construct(int $year, string $semester)
    {
        $this->year = $year;
        $this->semester = $semester;

        $this->semesterMonths = $semester === '1st Semester'
        ? [8, 9, 10, 11, 12]
        : [1, 2, 3, 4, 5];
    }

    public function model(array $row)
    {
        DB::transaction(function () use ($row) {
            // Check if email is used by another student (different student_id)
            $emailUsedByAnotherStudent = Students::where('email', $row['email'])
            ->where('student_id', '!=', $row['student_id'])
            ->exists();

            if ($emailUsedByAnotherStudent) {
                $this->failedImports[] = [
                    'student_id' => $row['student_id'],
                    'firstname' => $row['firstname'],
                    'lastname' => $row['lastname'],
                    'email' => $row['email'],
                    'reason' => 'Duplicate email in Students table',
                ];
                return;
            }

            // Upsert student info
            $existingStudent = Students::where('student_id', $row['student_id'])->first();

            if ($existingStudent) {
                $updateData = [
                    'firstname'  => $row['firstname'],
                    'middlename' => $row['middlename'] ?? null,
                    'lastname'   => $row['lastname'],
                    'department' => $row['department'],
                    'year_level' => $row['year_level'],
                    'program'    => $row['program'],
                    'email'      => $row['email'],
                ];

                $existingStudent->update($updateData);
            } else {
                Students::create([
                    'student_id' => $row['student_id'],
                    'firstname'  => $row['firstname'],
                    'middlename' => $row['middlename'] ?? null,
                    'lastname'   => $row['lastname'],
                    'email'      => $row['email'],
                    'department' => $row['department'],
                    'year_level' => $row['year_level'],
                    'program'    => $row['program'],
                ]);
            }

            // 🔄 Upsert into StudentsToDiagnose
            StudentsToDiagnose::updateOrCreate(
                ['student_id' => $row['student_id']],
                [
                    'firstname'  => $row['firstname'],
                    'middlename' => $row['middlename'] ?? null,
                    'lastname'   => $row['lastname'],
                    'email'      => $row['email'],
                    'year_level' => $row['year_level'],
                    'department' => $row['department'],
                    'program'    => $row['program'],
                    'show_status' => 'No Show',
                    'show_status_prev' => 'No Show',
                ]
            );

            foreach ($this->semesterMonths as $month) {
                $schoolYear = ($month >= 8 && $month <= 12)
                ? $this->year . '-' . ($this->year + 1)
                : ($this->year - 1) . '-' . $this->year;

                if ($month === $this->semesterMonths[0]) {
                    $emailUsedByAnotherClassList = ClassLists::where('email', $row['email'])
                    ->where('student_id', '!=', $row['student_id'])
                    ->where('semester', $this->semester)
                    ->where('school_year', $schoolYear)
                    ->exists();

                    if ($emailUsedByAnotherClassList) {
                        $this->failedImports[] = [
                            'student_id' => $row['student_id'],
                        'firstname' => $row['firstname'],
                        'lastname' => $row['lastname'],
                        'email' => $row['email'],
                        'reason' => 'Duplicate email in ClassLists table for this semester and school year',
                        ];
                        continue;
                    }

                    // Upsert ClassLists
                    $classListData = [
                        'student_id'            => $row['student_id'],
                        'firstname'             => $row['firstname'],
                        'middlename'            => $row['middlename'] ?? null,
                        'lastname'              => $row['lastname'],
                        'email'                 => $row['email'],
                        'program'               => $row['program'],
                        'department'            => $row['department'],
                        'year_level'            => $row['year_level'],
                        'gender'                => $row['gender'],
                        'status'                => $row['status'] ?? 'Active',
                        'classification'        => $row['classification'],
                        'reason_for_shift_or_drop' => $row['reason_for_shift_or_drop'] ?? null,
                        'pronunciation'         => $row['pronunciation'] ?? null,
                        'grammar'               => $row['grammar'] ?? null,
                        'fluency'               => $row['fluency'] ?? null,
                        'epgf_average'          => $row['epgf_average'] ?? null,
                        'completion_rate'       => $row['completion_rate'] ?? null,
                        'proficiency_level'     => $row['proficiency_level'] ?? null,
                        'course_code'           => $row['course_code'],
                        'semester'              => $this->semester,
                        'school_year'           => $schoolYear,
                        'change_note'           => "Imported for month $month",
                    ];

                    ClassLists::updateOrCreate(
                        [
                            'student_id'  => $row['student_id'],
                            'semester'    => $this->semester,
                            'school_year' => $schoolYear,
                        ],
                        $classListData
                    );
                }

                // Create HistoricalClassLists
                $classListDataHistorical = [
                    'student_id'            => $row['student_id'],
                    'firstname'             => $row['firstname'],
                    'middlename'            => $row['middlename'] ?? null,
                    'lastname'              => $row['lastname'],
                    'email'                 => $row['email'],
                    'program'               => $row['program'],
                    'department'            => $row['department'],
                    'year_level'            => $row['year_level'],
                    'gender'                => $row['gender'],
                    'status'                => $row['status'] ?? 'Active',
                    'classification'        => $row['classification'],
                    'reason_for_shift_or_drop' => $row['reason_for_shift_or_drop'] ?? null,
                    'pronunciation'         => $row['pronunciation'] ?? null,
                    'grammar'               => $row['grammar'] ?? null,
                    'fluency'               => $row['fluency'] ?? null,
                    'epgf_average'          => $row['epgf_average'] ?? null,
                    'completion_rate'       => $row['completion_rate'] ?? null,
                    'proficiency_level'     => $row['proficiency_level'] ?? null,
                    'course_code'           => $row['course_code'],
                    'semester'              => $this->semester,
                    'school_year'           => $schoolYear,
                    'change_note'           => "Imported for month $month",
                ];

                $now = Carbon::now();
                $createdAt = Carbon::create(
                    now()->year,
                                            $month,
                                            $now->day,
                                            $now->hour,
                                            $now->minute,
                                            $now->second
                );

                HistoricalClassLists::create(array_merge($classListDataHistorical, [
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]));
            }
        });

        return null;
    }

    /**
     * Return all failed imports with reasons
     */
    public function getFailedImports()
    {
        return $this->failedImports;
    }
}
