<?php

namespace App\Imports;

use App\Models\ClassLists;
use App\Models\Students;
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
            // Upsert student info
            $existingStudent = Students::where('student_id', $row['student_id'])->first();
            $emailUsedByAnother = Students::where('email', $row['email'])
            ->where('student_id', '!=', $row['student_id'])
            ->exists();

            if ($existingStudent) {
                $updateData = [
                    'firstname'  => $row['firstname'],
                    'middlename' => $row['middlename'] ?? null,
                    'lastname'   => $row['lastname'],
                    'department' => $row['department'],
                    'year_level' => $row['year_level'],
                    'program'    => $row['program'],
                ];

                if (!$emailUsedByAnother) {
                    $updateData['email'] = $row['email'];
                }

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

            // Insert or update unique ClassLists record (one per student per semester & school_year)
            foreach ($this->semesterMonths as $month) {
                $schoolYear = ($month >= 8 && $month <= 12)
                ? $this->year . '-' . ($this->year + 1)
                : ($this->year - 1) . '-' . $this->year;

                // Prepare class list data
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

                // Insert/update unique ClassLists record only once (using first month)
                if ($month === $this->semesterMonths[0]) {
                    ClassLists::updateOrCreate(
                        [
                            'student_id' => $row['student_id'],
                            'semester'   => $this->semester,
                            'school_year'=> $schoolYear,
                        ],
                        $classListData
                    );
                }

                // Create created_at and updated_at using current year, semester month, current day and time
                $now = Carbon::now();
                $yearForTimestamp = now()->year;

                $createdAt = Carbon::create(
                    $yearForTimestamp,
                    $month,
                    $now->day,
                    $now->hour,
                    $now->minute,
                    $now->second
                );

                // Both created_at and updated_at set the same to avoid null
                $updatedAt = $createdAt->copy();

                HistoricalClassLists::create(array_merge($classListData, [
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ]));
            }
        });

        return null;
    }
}
