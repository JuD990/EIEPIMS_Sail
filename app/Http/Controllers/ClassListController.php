<?php
namespace App\Http\Controllers;

use App\Imports\ClassListImport;
use App\Models\ClassLists;
use App\Models\EIEHeads;
use App\Models\HistoricalClassLists;
use App\Models\CollegePOCs;
use App\Models\ImplementingSubjects;
use App\Models\EieScorecardClassReport;
use App\Models\HistoricalScorecard;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\EpgfRubric;
use App\Models\EieReport;
use App\Models\EieChampions;

class ClassListController extends Controller
{
    public function filterStudents(Request $request)
    {
        try {
            $courseCode = $request->query('course_code');
            $employeeId = $request->query('employee_id');

            // Validate if course_code and employee_id are provided
            if (!$courseCode || !$employeeId) {
                return response()->json(['error' => 'Course code and employee ID are required.'], 400);
            }

            // Query the database for all matching records
            $ImplementingSubjects = DB::table('implementing_subjects')
            ->where('course_code', $courseCode)
            ->where('employee_id', $employeeId)
            ->get();

            // Check if any students were found
            if ($ImplementingSubjects->isEmpty()) {
                return response()->json(['message' => 'No students'], 404);
            }

            // Return the students' data
            return response()->json($ImplementingSubjects, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }


    public function getClassListByDepartment(Request $request)
    {
        try {
            // Get employee_id from the request (or from auth if using authentication)
            $employeeId = $request->query('employee_id');

            if (!$employeeId) {
                return response()->json(['message' => 'Employee ID is required'], 400);
            }

            // Find the department of the employee
            $eieHead = EIEHeads::where('employee_id', $employeeId)->first();

            if (!$eieHead) {
                return response()->json(['message' => 'Employee not found in EIEHeads'], 404);
            }

            // Get only ACTIVE students based on department
            $students = ClassLists::where('department', $eieHead->department)
            ->where('status', 'Active') // Filter only active students
            ->select(
                'class_lists_id',
                'student_id',
                'firstname',
                'middlename',
                'lastname',
                'status',
                'year_level',
                'classification',
                'gender',
                'reason_for_shift_or_drop',
                'course_code',
                'epgf_average',
                'proficiency_level',
                'pronunciation_average',
                'grammar_average',
                'fluency_average',
                'program',
                'candidate_for_graduating'
            )
            ->get();

            return response()->json($students, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching class list by department: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching class list.'], 500);
        }
    }

    public function getDroppedClassListByDepartment(Request $request)
    {
        try {
            // Get employee_id from the request
            $employeeId = $request->query('employee_id');

            if (!$employeeId) {
                return response()->json(['message' => 'Employee ID is required'], 400);
            }

            // Find the department of the employee
            $eieHead = EIEHeads::where('employee_id', $employeeId)->first();

            if (!$eieHead) {
                return response()->json(['message' => 'Employee not found in EIEHeads'], 404);
            }

            // Get only DROPPED students based on department
            $students = ClassLists::where('department', $eieHead->department)
            ->where('status', 'Dropped') // Filter dropped students
            ->select(
                'class_lists_id',
                'student_id',
                'firstname',
                'middlename',
                'lastname',
                'status',
                'year_level',
                'classification',
                'gender',
                'reason_for_shift_or_drop',
                'course_code',
                'epgf_average',
                'proficiency_level',
                'pronunciation_average',
                'grammar_average',
                'fluency_average',
                'program',
                'candidate_for_graduating'
            )
            ->get();

            return response()->json($students, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching class list by department: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching class list.'], 500);
        }
    }


    public function uploadClassList(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        try {
            $currentDate = Carbon::now();
            $year = $currentDate->year;
            $month = $currentDate->month;

            if ($month >= 8 && $month <= 12) {
                $semester = '1st Semester';
            } elseif ($month >= 1 && $month <= 5) {
                $semester = '2nd Semester';
            } else {
                return response()->json(['message' => 'Current date is outside of defined semesters.'], 422);
            }

            $import = new ClassListImport($year, $semester);
            Excel::import($import, $request->file('file'));

            // Update enrolled_students count per course_code (no semester/year filtering)
            $studentCounts = ClassLists::select('course_code', DB::raw('count(*) as count'))
            ->groupBy('course_code')
            ->get();

            foreach ($studentCounts as $entry) {
                ImplementingSubjects::where('course_code', $entry->course_code)
                ->update(['enrolled_students' => $entry->count]);
            }

            // Update active_students count per course_code (count where status = 'Active')
            $activeCounts = ClassLists::select('course_code', DB::raw('count(*) as active_count'))
            ->where('status', 'Active')
            ->groupBy('course_code')
            ->get();

            foreach ($activeCounts as $entry) {
                ImplementingSubjects::where('course_code', $entry->course_code)
                ->update(['active_students' => $entry->active_count]);
            }

            $failedImports = $import->getFailedImports();

            return response()->json([
                'message' => 'Class List uploaded and enrollment counts updated successfully!',
                'failedImports' => $failedImports,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error uploading class list: ' . $e->getMessage());
            return response()->json(['message' => 'Error uploading file: ' . $e->getMessage()], 500);
        }
    }

    public function ManageClassList(Request $request)
    {
        try {
            $employeeId = $request->query('employee_id');

            // Determine the current semester based on the current month
            $currentMonth = now()->month;

            if ($currentMonth >= 1 && $currentMonth <= 5) {
                $currentSemester = '2nd Semester'; // January to May
            } elseif ($currentMonth >= 8 && $currentMonth <= 12) {
                $currentSemester = '1st Semester'; // August to December
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No Classes Available for the current semester'
                ]);
            }

            // Get the course codes for the current semester and employee_id
            $excludedCourseCodes = ImplementingSubjects::where('employee_id', $employeeId)
            ->where('semester', $currentSemester)
            ->pluck('course_code')
            ->toArray();

            if (empty($excludedCourseCodes)) {
                return response()->json([], 200); // Return an empty array if no courses
            }

            // Fetch students excluding the courses in the current semester
            $students = ClassLists::select(
                'class_lists_id',
                'student_id',
                'firstname',
                'middlename',
                'lastname',
                'status',
                'year_level',
                'program',
                'classification',
                'gender',
                'reason_for_shift_or_drop',
                'course_code',
                'epgf_average',
                'proficiency_level',
                'pronunciation_average',
                'grammar_average',
                'fluency_average',
            )
            ->whereIn('course_code', $excludedCourseCodes)
            ->get();

            return response()->json($students, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching class list: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching class list.'], 500);
        }
    }

    public function updateStudent(Request $request, $class_lists_id)
    {
        try {
            $request->validate([
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'classification' => 'nullable|string',
                'yearLevel' => 'required|string',
                'status' => 'required|string',
                'gender' => 'nullable|string',
                'reason' => 'nullable|string',
                'courseCode' => 'nullable|string',
                'candidate_for_graduating' => 'nullable|string',
            ]);

            $student = ClassLists::where('class_lists_id', $class_lists_id)->first();

            if (!$student) {
                return response()->json(['message' => 'Student not found.'], 404);
            }

            $student->firstname = $request->input('firstName');
            $student->middlename = $request->input('middleName');
            $student->lastname = $request->input('lastName');
            $student->classification = $request->input('classification');
            $student->year_level = $request->input('yearLevel');
            $student->gender = $request->input('gender');
            $student->status = $request->input('status');
            $student->reason_for_shift_or_drop = $request->input('reason');
            $student->course_code = $request->input('courseCode');
            $student->candidate_for_graduating = $request->input('candidate_for_graduating');

            $student->save();

            return response()->json(['message' => 'Student updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Update failed.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateStudentCollegePoc(Request $request, $class_lists_id)
    {
        try {
            $request->validate([
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'classification' => 'nullable|string',
                'yearLevel' => 'required|string',
                'status' => 'required|string',
                'gender' => 'nullable|string',
                'reason' => 'nullable|string',
                'courseCode' => 'nullable|string',
            ]);

            $student = ClassLists::where('class_lists_id', $class_lists_id)->first();

            if (!$student) {
                return response()->json(['message' => 'Student not found.'], 404);
            }

            $student->firstname = $request->input('firstName');
            $student->middlename = $request->input('middleName');
            $student->lastname = $request->input('lastName');
            $student->classification = $request->input('classification');
            $student->year_level = $request->input('yearLevel');
            $student->gender = $request->input('gender');
            $student->status = $request->input('status');
            $student->reason_for_shift_or_drop = $request->input('reason');
            $student->course_code = $request->input('courseCode');

            $student->save();

            return response()->json(['message' => 'Student updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Update failed.', 'error' => $e->getMessage()], 500);
        }
    }

    public function fetchMonthlyChamps()
    {
        // Get the current month
        $currentMonth = Carbon::now()->month;

        // Fetch records where epgf_average is not null and greater than 0,
        // and where the created_at month matches the current month (ignoring the year)
        $classLists = ClassLists::whereNotNull('epgf_average')
        ->where('epgf_average', '>', 0)
        ->whereMonth('created_at', $currentMonth)
        ->orderByDesc('epgf_average')
        ->get();

        return response()->json($classLists);
    }
    public function getCoursesByDepartment(Request $request)
    {
        $employeeId = $request->header('X-Employee-ID');

        if (!$employeeId) {
            return response()->json(['error' => 'Employee ID is required'], 400);
        }

        $user = EIEHeads::where('employee_id', $employeeId)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $department = $user->department;

        // Step 1: Get distinct course_codes from ClassLists
        $courseCodes = ClassLists::where('department', $department)
        ->select('course_code')
        ->distinct()
        ->pluck('course_code');

        // Step 2: Get matching course_titles from ImplementingSubjects
        $courses = ImplementingSubjects::whereIn('course_code', $courseCodes)
        ->where('department', $department)
        ->select('course_code', 'course_title')
        ->distinct()
        ->get();

        // Optional: group by course_title if you want same structure as before
        $groupedCourses = $courses->groupBy('course_title')->map(function ($group) {
            return $group->pluck('course_code')->unique()->values();
        })->toArray();

        return response()->json($groupedCourses);
    }


    public function getCoursesByDepartmentStudent(Request $request)
    {
        $employeeId = $request->header('employee_id');

        if (!$employeeId) {
            return response()->json(['error' => 'Employee ID is required'], 400);
        }

        $employee = EIEHeads::where('employee_id', $employeeId)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $department = $employee->department;

        // Determine current semester based on the current month
        $currentMonth = now()->month;
        $semester = ($currentMonth >= 8 && $currentMonth <= 12) ? '1st Semester' : '2nd Semester';

        // Fetch courses filtered by department and semester
        $courses = ImplementingSubjects::select('course_code', 'course_title')
        ->where('department', $department)
        ->where('semester', $semester)
        ->distinct()
        ->get();

        return response()->json($courses);
    }


    public function getCoursesPOC(Request $request)
    {
        // Get the employee_id from the request header
        $employeeId = $request->header('X-Employee-ID');

        if (!$employeeId) {
            return response()->json(['error' => 'Employee ID is required'], 400);
        }

        // Find the user by employee_id
        $user = CollegePOCs::where('employee_id', $employeeId)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Get the department of the user
        $department = $user->department;

        // Fetch courses related to the user's department and employee_id
        $courses = ImplementingSubjects::where('department', $department)
        ->where('employee_id', $employeeId)
        ->select('course_title', 'course_code', 'department')
        ->get();

        // Optional: group by course_title if you want same structure as before
        $groupedCourses = $courses->groupBy('course_title')->map(function ($group) {
            return $group->pluck('course_code')->unique()->values();
        })->toArray();

        return response()->json($groupedCourses);
    }

    public function getStudentStatistics(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $department = EIEHeads::where('employee_id', $employeeId)->value('department');

        if (!$department) {
            return response()->json([
                'error' => 'Department not found for the provided employee ID.'
            ], 404);
        }

        $totalStudents = ClassLists::where('department', $department)->count();

        $activeStudents = ClassLists::where('department', $department)
        ->where('status', 'Active')
        ->count();

        $graduatingStudents = ClassLists::where('department', $department)
        ->where('candidate_for_graduating', 'Yes')
        ->where('status', 'Active')
        ->where(function ($query) {
            $query->where(function ($q) {
                return $q->where('program', 'ACT')
                ->where('year_level', '2nd Year');
            })->orWhere('year_level', '4th Year');
        })
        ->count();

        // Freshmen
        $freshmenTotal = ClassLists::where('department', $department)
        ->where('year_level', '1st Year')
        ->count();
        $freshmenActive = ClassLists::where('department', $department)
        ->where('year_level', '1st Year')
        ->where('status', 'Active')
        ->count();
        $freshmenPercentage = $freshmenTotal > 0 ? round(($freshmenActive / $freshmenTotal) * 100, 2) : 0;

        // Sophomores
        $sophomoreTotal = ClassLists::where('department', $department)
        ->where('year_level', '2nd Year')
        ->count();
        $sophomoreActive = ClassLists::where('department', $department)
        ->where('year_level', '2nd Year')
        ->where('status', 'Active')
        ->count();
        $sophomorePercentage = $sophomoreTotal > 0 ? round(($sophomoreActive / $sophomoreTotal) * 100, 2) : 0;

        // Juniors
        $juniorTotal = ClassLists::where('department', $department)
        ->where('year_level', '3rd Year')
        ->count();
        $juniorActive = ClassLists::where('department', $department)
        ->where('year_level', '3rd Year')
        ->where('status', 'Active')
        ->count();
        $juniorPercentage = $juniorTotal > 0 ? round(($juniorActive / $juniorTotal) * 100, 2) : 0;

        // Seniors
        $seniorTotal = ClassLists::where('department', $department)
        ->where('year_level', '4th Year')
        ->count();
        $seniorActive = ClassLists::where('department', $department)
        ->where('year_level', '4th Year')
        ->where('status', 'Active')
        ->count();
        $seniorPercentage = $seniorTotal > 0 ? round(($seniorActive / $seniorTotal) * 100, 2) : 0;

        // 🔸 Determine current semester based on current month
        $currentMonth = now()->month;
        $currentSemester = ($currentMonth >= 8 && $currentMonth <= 12) ? '1st Semester' : '2nd Semester';

        // Get subjects or course titles by year level from ImplementingSubjects
        $subjectsByYearLevel = ImplementingSubjects::whereIn('year_level', ['1st Year', '2nd Year', '3rd Year', '4th Year'])
        ->where('department', $department)
        ->where('semester', $currentSemester)
        ->get(['year_level', 'course_title', 'program']);

        $subjectsByYearLevelGrouped = $subjectsByYearLevel->groupBy('year_level');

        $activePercentage = $totalStudents > 0
        ? round(($activeStudents / $totalStudents) * 100, 2)
        : 0;

        return response()->json([
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'active_percentage' => $activePercentage,
            'graduating_students' => $graduatingStudents,

            'freshmen' => [
                'total' => $freshmenTotal,
                'active' => $freshmenActive,
                'active_percentage' => $freshmenPercentage,
                'subjects' => $subjectsByYearLevelGrouped['1st Year'] ?? [],
            ],
            'sophomores' => [
                'total' => $sophomoreTotal,
                'active' => $sophomoreActive,
                'active_percentage' => $sophomorePercentage,
                'subjects' => $subjectsByYearLevelGrouped['2nd Year'] ?? [],
            ],
            'juniors' => [
                'total' => $juniorTotal,
                'active' => $juniorActive,
                'active_percentage' => $juniorPercentage,
                'subjects' => $subjectsByYearLevelGrouped['3rd Year'] ?? [],
            ],
            'seniors' => [
                'total' => $seniorTotal,
                'active' => $seniorActive,
                'active_percentage' => $seniorPercentage,
                'subjects' => $subjectsByYearLevelGrouped['4th Year'] ?? [],
            ],
        ]);
    }

    public function getStudentsByMonth(Request $request)
    {
        $request->validate([
            'course_code' => 'required|string|max:10',
            'month' => 'required|string',
        ]);

        $months = [
            'january' => 1, 'february' => 2, 'march' => 3, 'april' => 4, 'may' => 5,
            'june' => 6, 'july' => 7, 'august' => 8, 'september' => 9,
            'october' => 10, 'november' => 11, 'december' => 12,
        ];

        $inputMonth = strtolower($request->month);

        if (is_numeric($inputMonth)) {
            $month = (int) $inputMonth;
        } elseif (array_key_exists($inputMonth, $months)) {
            $month = $months[$inputMonth];
        } else {
            return response()->json(['error' => 'Invalid month provided. Use full month name or number.'], 422);
        }

        if ($month < 1 || $month > 12) {
            return response()->json(['error' => 'Month must be between 1 and 12.'], 422);
        }

        // Use current year internally, no year input from request
        $year = date('Y');

        if ($month >= 8 && $month <= 12) {
            $semester = '1st Semester';
            $startDate = Carbon::create($year, 8, 1)->startOfDay();
            $endDate = Carbon::create($year, 12, 31)->endOfDay();
        } elseif ($month >= 1 && $month <= 5) {
            $semester = '2nd Semester';
            $startDate = Carbon::create($year, 1, 1)->startOfDay();
            $endDate = Carbon::create($year, 5, 31)->endOfDay();
        } else {
            return response()->json(['error' => 'Invalid month. Must be between January–May or August–December.'], 422);
        }

        $results = HistoricalClassLists::where('course_code', $request->course_code)
        ->where('status', 'active')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->whereMonth('created_at', $month)
        ->orderBy('lastname', 'asc')
        ->get();

        return response()->json([
            'semester' => $semester,
            'year' => $year,
            'records' => $results,
        ]);
    }

    protected $epgfProficiencyLevels = [
        ['threshold' => 0.0, 'level' => 'Beginning'],
        ['threshold' => 0.5, 'level' => 'Low Acquisition'],
        ['threshold' => 0.75, 'level' => 'High Acquisition'],
        ['threshold' => 1.0, 'level' => 'Emerging'],
        ['threshold' => 1.25, 'level' => 'Low Developing'],
        ['threshold' => 1.5, 'level' => 'High Developing'],
        ['threshold' => 1.75, 'level' => 'Low Proficient'],
        ['threshold' => 2.0, 'level' => 'Proficient'],
        ['threshold' => 2.25, 'level' => 'High Proficient'],
        ['threshold' => 2.5, 'level' => 'Advanced'],
        ['threshold' => 3.0, 'level' => 'High Advanced'],
        ['threshold' => 4.0, 'level' => 'Native/Bilingual'],
    ];

    protected function getProficiencyLevel(float $epgfAverage): string
    {
        $levels = $this->epgfProficiencyLevels;

        // Sort descending by threshold
        usort($levels, function ($a, $b) {
            return $b['threshold'] <=> $a['threshold'];
        });

        foreach ($levels as $level) {
            if ($epgfAverage >= $level['threshold']) {
                return $level['level'];
            }
        }

        return 'Unknown';
    }

    public function saveData(Request $request)
    {
        try {
            $data = $request->input('data');

            $now = Carbon::now();

            // Determine current semester
            $month = $now->month;
            if ($month >= 8 && $month <= 12) {
                $currentSemester = '1st Semester';
            } elseif ($month >= 1 && $month <= 5) {
                $currentSemester = '2nd Semester';
            } else {
                $currentSemester = '2nd Semester'; // default for June & July
            }

            // Get active rubric id
            $activeRubric = EpgfRubric::where('status', 'active')->first();
            $activeRubricId = $activeRubric ? $activeRubric->epgf_rubric_id : null;

            foreach ($data as $record) {
                $epgfAverage = floatval($record['epgf_average'] ?? 0);

                $schoolYear = $record['school_year'] ?? $now->year;
                $semester = $record['semester'] ?? $currentSemester;

                $courseTitle = null;
                if (!empty($record['course_code'])) {
                    $subject = ImplementingSubjects::where('course_code', $record['course_code'])->first();
                    if ($subject) {
                        $courseTitle = $subject->course_title;
                    }
                }

                $proficiency = $this->getProficiencyLevel($epgfAverage);

                HistoricalClassLists::updateOrCreate(
                    ['historical_class_lists_id' => $record['historical_class_lists_id']],
                    [
                        'consistency_rating' => $record['consistency_rating'],
                        'clarity_rating' => $record['clarity_rating'],
                        'articulation_rating' => $record['articulation_rating'],
                        'intonation_and_stress_rating' => $record['intonation_and_stress_rating'],
                        'pronunciation_average' => $record['pronunciation_average'],
                        'accuracy_rating' => $record['accuracy_rating'],
                        'clarity_of_thought_rating' => $record['clarity_of_thought_rating'],
                        'syntax_rating' => $record['syntax_rating'],
                        'grammar_average' => $record['grammar_average'],
                        'quality_of_response_rating' => $record['quality_of_response_rating'],
                        'detail_of_response_rating' => $record['detail_of_response_rating'],
                        'fluency_average' => $record['fluency_average'],
                        'epgf_average' => $epgfAverage,
                        'type' => $record['type'],
                        'task_title' => $record['task_title'] ?? null,
                        'consistency_descriptor' => $record['consistency_descriptor'],
                        'clarity_descriptor' => $record['clarity_descriptor'],
                        'articulation_descriptor' => $record['articulation_descriptor'],
                        'intonation_and_stress_descriptor' => $record['intonation_and_stress_descriptor'],
                        'accuracy_descriptor' => $record['accuracy_descriptor'],
                        'clarity_of_thought_descriptor' => $record['clarity_of_thought_descriptor'],
                        'syntax_descriptor' => $record['syntax_descriptor'],
                        'quality_of_response_descriptor' => $record['quality_of_response_descriptor'],
                        'detail_of_response_descriptor' => $record['detail_of_response_descriptor'],
                        'comment' => $record['comment'],
                        'proficiency_level' => $proficiency,
                        'epgf_rubric_id' => $activeRubricId,
                        'semester' => $semester,
                        'school_year' => $schoolYear,
                        'course_title' => $courseTitle,
                        'change_note' => $record['month'],
                    ]
                );
            }

            return response()->json(['message' => 'Data saved successfully!'], 200);
        } catch (\Exception $e) {
            \Log::error("Error saving data: " . $e->getMessage());
            return response()->json(['message' => 'Failed to save data'], 500);
        }
    }

    public function submitData(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'data.*.student_id' => 'required|string',
            'data.*.course_code' => 'required|string',
            'data.*.task_title' => 'required|string',
            'data.*.month' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $data = $request->input('data');
            $month = $data[0]['month']; // All entries must be from the same month

            // Determine current semester
            $now = Carbon::now();
            $currentSemester = match(true) {
                $now->month >= 8 && $now->month <= 12 => '1st Semester',
                $now->month >= 1 && $now->month <= 5 => '2nd Semester',
                default => '2nd Semester', // For June and July
            };

            $activeRubric = EpgfRubric::where('status', 'active')->first();
            $activeRubricId = $activeRubric?->epgf_rubric_id;

            $historicalData = [];

            foreach ($data as $record) {
                $epgfAverage = floatval($record['epgf_average'] ?? 0);

                $courseTitle = null;
                if (!empty($record['course_code'])) {
                    $subject = ImplementingSubjects::where('course_code', $record['course_code'])->first();
                    $courseTitle = $subject?->course_title;
                }

                $proficiency = $this->getProficiencyLevel($epgfAverage);

                $commonData = [
                    'course_code' => $record['course_code'],
                    'epgf_rubric_id' => $activeRubricId,
                    'student_id' => $record['student_id'],
                    'department' => $record['department'] ?? null,
                    'task_title' => $record['task_title'],
                    'type' => $record['type'] ?? null,
                    'comment' => $record['comment'] ?? null,
                    'epgf_average' => $epgfAverage,
                    'proficiency_level' => $proficiency,
                    'program' => $record['program'] ?? null,
                    'course_title' => $courseTitle,
                    'year_level' => $record['year_level'] ?? null,
                    'change_note' => $record['month'],

                    // Pronunciation
                    'consistency_descriptor' => $record['consistency_descriptor'] ?? '',
                    'consistency_rating' => $record['consistency_rating'] ?? 0,
                    'clarity_descriptor' => $record['clarity_descriptor'] ?? '',
                    'clarity_rating' => $record['clarity_rating'] ?? 0,
                    'articulation_descriptor' => $record['articulation_descriptor'] ?? '',
                    'articulation_rating' => $record['articulation_rating'] ?? 0,
                    'intonation_and_stress_descriptor' => $record['intonation_and_stress_descriptor'] ?? '',
                    'intonation_and_stress_rating' => $record['intonation_and_stress_rating'] ?? 0,
                    'pronunciation_average' => $record['pronunciation_average'] ?? 0,

                    // Grammar
                    'accuracy_descriptor' => $record['accuracy_descriptor'] ?? '',
                    'accuracy_rating' => $record['accuracy_rating'] ?? 0,
                    'clarity_of_thought_descriptor' => $record['clarity_of_thought_descriptor'] ?? '',
                    'clarity_of_thought_rating' => $record['clarity_of_thought_rating'] ?? 0,
                    'syntax_descriptor' => $record['syntax_descriptor'] ?? '',
                    'syntax_rating' => $record['syntax_rating'] ?? 0,
                    'grammar_average' => $record['grammar_average'] ?? 0,

                    // Fluency
                    'quality_of_response_descriptor' => $record['quality_of_response_descriptor'] ?? '',
                    'quality_of_response_rating' => $record['quality_of_response_rating'] ?? 0,
                    'detail_of_response_descriptor' => $record['detail_of_response_descriptor'] ?? '',
                    'detail_of_response_rating' => $record['detail_of_response_rating'] ?? 0,
                    'fluency_average' => $record['fluency_average'] ?? 0,
                ];

                // Upsert EieScorecardClassReport
                $uniqueKeys = [
                    'student_id' => $record['student_id'],
                    'course_code' => $record['course_code'],
                    'epgf_rubric_id' => $activeRubricId,
                    'task_title' => $record['task_title'],
                    'change_note' => $record['month'],
                ];

                EieScorecardClassReport::updateOrCreate($uniqueKeys, $commonData);

                // Collect for batch insert into HistoricalScorecard
                $historicalData[] = $commonData;
            }

            HistoricalScorecard::insert($historicalData);

            // === Update ClassLists and EieScorecardClassReport (per student per course) ===
            $studentCourses = HistoricalClassLists::select('student_id', 'course_code')
            ->distinct()
            ->get();

            foreach ($studentCourses as $entry) {
                $averages = HistoricalClassLists::where('student_id', $entry->student_id)
                ->where('course_code', $entry->course_code)
                ->select(
                    DB::raw('AVG(COALESCE(pronunciation_average, 0)) as avg_pronunciation'),
                         DB::raw('AVG(COALESCE(grammar_average, 0)) as avg_grammar'),
                         DB::raw('AVG(COALESCE(fluency_average, 0)) as avg_fluency'),
                         DB::raw('AVG(COALESCE(epgf_average, 0)) as avg_epgf')
                )
                ->first();

                $proficiency = $this->getProficiencyLevel($averages->avg_epgf);

                ClassLists::where('student_id', $entry->student_id)
                ->where('course_code', $entry->course_code)
                ->update([
                    'proficiency_level' => $proficiency,
                    'pronunciation_average' => $averages->avg_pronunciation,
                    'grammar_average' => $averages->avg_grammar,
                    'fluency_average' => $averages->avg_fluency,
                    'epgf_average' => $averages->avg_epgf,
                ]);

                EieScorecardClassReport::where('student_id', $entry->student_id)
                ->where('course_code', $entry->course_code)
                ->update([
                    'pronunciation_average' => $averages->avg_pronunciation,
                    'grammar_average' => $averages->avg_grammar,
                    'fluency_average' => $averages->avg_fluency,
                    'epgf_average' => $averages->avg_epgf,
                ]);
            }

            // === Update EieReport per course_code ===
            $courseCodes = HistoricalClassLists::distinct()->pluck('course_code');
            foreach ($courseCodes as $courseCode) {
                $averages = HistoricalClassLists::where('course_code', $courseCode)
                ->select(
                    DB::raw('AVG(COALESCE(pronunciation_average, 0)) as avg_pronunciation'),
                         DB::raw('AVG(COALESCE(grammar_average, 0)) as avg_grammar'),
                         DB::raw('AVG(COALESCE(fluency_average, 0)) as avg_fluency'),
                         DB::raw('AVG(COALESCE(epgf_average, 0)) as avg_epgf')
                )
                ->first();

                $submitted = ClassLists::where('course_code', $courseCode)
                ->where('status', 'Active')
                ->where('epgf_average', '>', 0)
                ->count();

                $population = ClassLists::where('course_code', $courseCode)->count();

                $completionRate = $population > 0
                ? round(($submitted / $population) * 100, 2)
                : 0;

                EieReport::where('course_code', $courseCode)
                ->update([
                    'epgf_average' => $averages->avg_epgf,
                    'completion_rate' => $completionRate,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Data submitted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in submitData: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function storeSelectedChamp(Request $request)
    {
        $champion = new EieChampions();
        $champion->student_id = $request->student_id;
        $champion->firstname = $request->firstname;
        $champion->middlename = $request->middlename;
        $champion->lastname = $request->lastname;
        $champion->email = $request->email;
        $champion->year_level = $request->year_level;
        $champion->department = $request->department;
        $champion->program = $request->program;
        $champion->gender = $request->gender;
        $champion->epgf_average = $request->epgf_average;

        // Optional fields
        $champion->times_won = $request->times_won ?? 1; // default 1
        $champion->semester = $request->semester ?? '1st Semester'; // default semester

        $champion->save();

        return response()->json(['message' => 'Champion added successfully'], 201);
    }

    public function checkMonth(Request $request)
    {
        try {
            $currentYear = Carbon::now()->year;
            $month = $request->month;
            $courseCode = $request->courseCode; // from frontend (camelCase)

            Log::info('Checking submission existence for month: ' . $month . ', year: ' . $currentYear . ', course_code: ' . $courseCode);

            $query = EieScorecardClassReport::where('change_note', $month)
            ->whereYear('created_at', $currentYear)
            ->where('course_code', $courseCode); // exact column name match

            $exists = $query->exists();

            return response()->json(['exists' => $exists]);
        } catch (\Exception $e) {
            Log::error('Error in checkMonth: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
}
