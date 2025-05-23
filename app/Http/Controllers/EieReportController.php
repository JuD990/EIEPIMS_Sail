<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ImplementingSubjects;
use App\Models\LeadPOCs;
use App\Models\EIEHeads;
use App\Models\EieReport;
use App\Models\ClassLists;
use App\Models\EieScorecardClassReport;
use App\Models\HistoricalClassLists;
use App\Models\HistoricalScorecard;
use App\Models\EieChampions;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class EieReportController extends Controller
{
    public function storeOrUpdatePrograms()
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $programs = ImplementingSubjects::all();

        if ($programs->isEmpty()) {
            return response()->json(['error' => 'No programs found in ImplementingSubjects'], 404);
        }

        $updatedEntries = [];
        $newEntries = [];

        foreach ($programs as $program) {
            if (empty($program->course_code)) {
                return response()->json([
                    'error' => "Course code is required for program: {$program->program}, year level: {$program->year_level}"
                ], 422);
            }

            // Count only rows with epgf_average > 0
            $submittedCount = EieScorecardClassReport::where('course_code', $program->course_code)
            ->where('epgf_average', '>', 0.00)
            ->count();

            $activeStudents = ClassLists::where('course_code', $program->course_code)
            ->where('status', 'active')  // or ->where('is_active', 1) depending on your schema
            ->count();

            // Calculate completion rate
            $completionRate = $activeStudents > 0
            ? round(($submittedCount / $activeStudents) * 100, 2)
            : 0;
            $completionRateExpectation = ($completionRate == 100) ? "Meets Expectation" : "Below Expectation";

            // Calculate average epgf_average for the course
            $epgfAverage = ClassLists::where('course_code', $program->course_code)
            ->select(DB::raw('AVG(COALESCE(epgf_average, 0)) as avg_epgf'))
            ->value('avg_epgf');

            // Determine proficiency level from the average
            $proficiencyLevel = $this->determineProficiencyLevel($epgfAverage);

            // Fetch Champion Student
            $champion = ClassLists::where('course_code', $program->course_code)
                ->where('epgf_average', '>', 0)
                ->orderByDesc('epgf_average')
                ->first();

            $championFullName = $champion ? "{$champion->firstname} {$champion->middlename} {$champion->lastname}" : null;
            $championId = $champion->class_lists_id ?? null;
            $championStudentId = $champion->student_id ?? null;
            $championEpgfAverage = $champion->epgf_average ?? 0;
            $championProficiencyLevel = $champion ? $this->determineProficiencyLevel($champion->epgf_average) : null;

            // Check if record exists for current month/year
            $existingRecord = EieReport::where([
                ['program', $program->program],
                ['year_level', $program->year_level],
                ['semester', $program->semester],
                ['course_code', $program->course_code],
            ])
            ->whereYear('created_at', $currentYear)
            ->whereMonth('created_at', $currentMonth)
            ->first();

            $reportData = [
                'program' => $program->program,
                'semester' => $program->semester,
                'year_level' => $program->year_level,
                'department' => $program->department,
                'assigned_poc' => $program->assigned_poc,
                'course_title' => $program->course_title,
                'course_code' => $program->course_code,
                'enrolled_students' => $program->enrolled_students ?? 0,
                'active_students' => $activeStudents,
                'completion_rate' => $completionRate,
                'completion_rate_expectation' => $completionRateExpectation,
                'epgf_average' => $epgfAverage,
                'proficiency_level' => $proficiencyLevel,
                'champion' => $championFullName,
                'champion_id' => $championId,
                'champion_student_id' => $championStudentId,
                'champion_epgf_average' => $championEpgfAverage,
                'champion_proficiency_level' => $championProficiencyLevel,
                'submitted' => $submittedCount,
            ];

            if ($existingRecord) {
                $existingRecord->update($reportData);
                $updatedEntries[] = $existingRecord->fresh();
            } else {
                $newEntries[] = EieReport::create($reportData);
            }
        }

        return response()->json([
            'message' => 'EIE Reports processed successfully',
            'updated_entries' => $updatedEntries,
            'new_entries' => $newEntries
        ]);
    }



    public function getDashboardReport(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');

        if (!$department || !$semester || !$schoolYear) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Validate school year format
        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        $grandTotals = [
            'expectedSubmissions' => 0,
            'submitted' => array_fill_keys($months, 0),
            'completionRate' => array_fill_keys($months, []),
            'epgfAverage' => array_fill_keys($months, []),
            'proficiencyLevel' => array_fill_keys($months, null),
            'champion' => array_fill_keys($months, null),
        ];

        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months, &$grandTotals) {
            $yearTotals = [
                'expectedSubmissions' => 0,
                'submitted' => array_fill_keys($months, 0),
                'completionRate' => array_fill_keys($months, []),
                'epgfAverage' => array_fill_keys($months, []),
                'proficiencyLevel' => array_fill_keys($months, null),
                'champion' => array_fill_keys($months, null),
            ];

            $yearLevelData = $yearLevelReports->groupBy('program')->map(function ($programReports) use ($months, &$yearTotals, &$grandTotals) {
                $monthData = [];

                foreach ($months as $month) {
                    $monthData[$month] = [
                        'submitted' => 0,
                        'completionRate' => 0,
                        'epgfAverage' => 0,
                        'proficiencyLevel' => null,
                        'champion' => null,
                        'champion_epgf_average' => 0,
                    ];
                }

                $firstReport = $programReports->first();
                $yearTotals['expectedSubmissions'] += $firstReport->active_students;
                $grandTotals['expectedSubmissions'] += $firstReport->active_students;

                foreach ($programReports as $report) {
                    $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                    if (in_array($monthName, $months)) {
                        // Treat null as 0, allow 0 in averages
                        $reportCompletionRate = is_null($report->completion_rate) ? 0 : $report->completion_rate;
                        $reportEpgfAverage = is_null($report->epgf_average) ? 0 : $report->epgf_average;

                        // Aggregate values for monthly data
                        $monthData[$monthName]['submitted'] += $report->submitted ?? 0;
                        $monthData[$monthName]['completionRate'] += $reportCompletionRate;
                        $monthData[$monthName]['epgfAverage'] += $reportEpgfAverage;
                        $monthData[$monthName]['proficiencyLevel'] = $this->determineProficiencyLevel($reportEpgfAverage);

                        // Determine the champion per month
                        if ($report->champion_epgf_average > $monthData[$monthName]['champion_epgf_average']) {
                            $monthData[$monthName]['champion'] = $report->champion;
                            $monthData[$monthName]['champion_epgf_average'] = $report->champion_epgf_average;
                        }

                        // Aggregate values for year and grand totals
                        $yearTotals['submitted'][$monthName] += $report->submitted ?? 0;
                        $yearTotals['completionRate'][$monthName][] = $reportCompletionRate;
                        $yearTotals['epgfAverage'][$monthName][] = $reportEpgfAverage;

                        $grandTotals['submitted'][$monthName] += $report->submitted ?? 0;
                        $grandTotals['completionRate'][$monthName][] = $reportCompletionRate;
                        $grandTotals['epgfAverage'][$monthName][] = $reportEpgfAverage;
                    }
                }

                return [
                    'program' => $firstReport->program,
                    'courseTitle' => $firstReport->course_title,
                    'enrolledStudents' => $firstReport->active_students,
                    'monthData' => $monthData,
                ];
            });

            foreach ($months as $month) {
                $yearTotals['completionRate'][$month] = count($yearTotals['completionRate'][$month]) > 0
                ? round(array_sum($yearTotals['completionRate'][$month]) / count($yearTotals['completionRate'][$month]), 2)
                : 0;

                $yearTotals['epgfAverage'][$month] = count($yearTotals['epgfAverage'][$month]) > 0
                ? round(array_sum($yearTotals['epgfAverage'][$month]) / count($yearTotals['epgfAverage'][$month]), 2)
                : 0;

                $yearTotals['proficiencyLevel'][$month] = $this->determineProficiencyLevel($yearTotals['epgfAverage'][$month]);

                $monthlyChampions = $yearLevelReports->filter(function ($report) use ($month) {
                    return \Carbon\Carbon::parse($report->created_at)->format('F') === $month;
                });

                $yearTotals['champion'][$month] = $monthlyChampions
                ->sortByDesc('champion_epgf_average')
                ->first()?->champion ?? null;
            }

            $yearLevelData['totals'] = $yearTotals;
            return $yearLevelData;
        });

        foreach ($months as $month) {
            $grandTotals['completionRate'][$month] = count($grandTotals['completionRate'][$month]) > 0
            ? round(array_sum($grandTotals['completionRate'][$month]) / count($grandTotals['completionRate'][$month]), 2)
            : 0;

            $grandTotals['epgfAverage'][$month] = count($grandTotals['epgfAverage'][$month]) > 0
            ? round(array_sum($grandTotals['epgfAverage'][$month]) / count($grandTotals['epgfAverage'][$month]), 2)
            : 0;

            $grandTotals['proficiencyLevel'][$month] = $this->determineProficiencyLevel($grandTotals['epgfAverage'][$month]);

            $monthlyChampions = $reports->filter(function ($report) use ($month) {
                return \Carbon\Carbon::parse($report->created_at)->format('F') === $month;
            });

            $grandTotals['champion'][$month] = $monthlyChampions
            ->sortByDesc('champion_epgf_average')
            ->first()?->champion ?? null;
        }

        return response()->json([
            'success' => true,
            'data' => $groupedData,
            'grandTotals' => $grandTotals,
        ]);
    }

    public function getDashboardAssignedReport(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');
        $employeeId = $request->input('employee_id');

        if (!$department || !$semester || !$schoolYear) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        // 👉 Filter course codes by employee_id
        $courseCodes = ImplementingSubjects::where('employee_id', $employeeId)
        ->pluck('course_code')
        ->toArray();

        if (empty($courseCodes)) {
            return response()->json(['success' => false, 'message' => 'No assigned subjects for this employee'], 404);
        }

        // 👉 Get only EieReports that match course codes
        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->whereIn('course_code', $courseCodes)
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        $grandTotals = [
            'expectedSubmissions' => 0,
            'submitted' => array_fill_keys($months, 0),
            'completionRate' => array_fill_keys($months, []),
            'epgfAverage' => array_fill_keys($months, []),
            'proficiencyLevel' => array_fill_keys($months, null),
            'champion' => array_fill_keys($months, null),
        ];

        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months, &$grandTotals) {
            $yearTotals = [
                'expectedSubmissions' => 0,
                'submitted' => array_fill_keys($months, 0),
                                                            'completionRate' => array_fill_keys($months, []),
                                                            'epgfAverage' => array_fill_keys($months, []),
                                                            'proficiencyLevel' => array_fill_keys($months, null),
                                                            'champion' => array_fill_keys($months, null),
            ];

            $yearLevelData = $yearLevelReports->groupBy('program')->map(function ($programReports) use ($months, &$yearTotals, &$grandTotals) {
                $monthData = [];

                foreach ($months as $month) {
                    $monthData[$month] = [
                        'submitted' => 0,
                        'completionRate' => 0,
                        'epgfAverage' => 0,
                        'proficiencyLevel' => null,
                        'champion' => null,
                        'champion_epgf_average' => 0,
                    ];
                }

                $firstReport = $programReports->first();
                $yearTotals['expectedSubmissions'] += $firstReport->active_students;
                $grandTotals['expectedSubmissions'] += $firstReport->active_students;

                foreach ($programReports as $report) {
                    $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                    if (in_array($monthName, $months)) {
                        $reportCompletionRate = is_null($report->completion_rate) ? 0 : $report->completion_rate;
                        $reportEpgfAverage = is_null($report->epgf_average) ? 0 : $report->epgf_average;

                        $monthData[$monthName]['submitted'] += $report->submitted ?? 0;
                        $monthData[$monthName]['completionRate'] += $reportCompletionRate;
                        $monthData[$monthName]['epgfAverage'] += $reportEpgfAverage;
                        $monthData[$monthName]['proficiencyLevel'] = $this->determineProficiencyLevel($reportEpgfAverage);

                        if ($report->champion_epgf_average > $monthData[$monthName]['champion_epgf_average']) {
                            $monthData[$monthName]['champion'] = $report->champion;
                            $monthData[$monthName]['champion_epgf_average'] = $report->champion_epgf_average;
                        }

                        $yearTotals['submitted'][$monthName] += $report->submitted ?? 0;
                        $yearTotals['completionRate'][$monthName][] = $reportCompletionRate;
                        $yearTotals['epgfAverage'][$monthName][] = $reportEpgfAverage;

                        $grandTotals['submitted'][$monthName] += $report->submitted ?? 0;
                        $grandTotals['completionRate'][$monthName][] = $reportCompletionRate;
                        $grandTotals['epgfAverage'][$monthName][] = $reportEpgfAverage;
                    }
                }

                return [
                    'program' => $firstReport->program,
                    'courseTitle' => $firstReport->course_title,
                    'enrolledStudents' => $firstReport->active_students,
                    'monthData' => $monthData,
                ];
            });

            foreach ($months as $month) {
                $yearTotals['completionRate'][$month] = count($yearTotals['completionRate'][$month]) > 0
                ? round(array_sum($yearTotals['completionRate'][$month]) / count($yearTotals['completionRate'][$month]), 2)
                : 0;

                $yearTotals['epgfAverage'][$month] = count($yearTotals['epgfAverage'][$month]) > 0
                ? round(array_sum($yearTotals['epgfAverage'][$month]) / count($yearTotals['epgfAverage'][$month]), 2)
                : 0;

                $yearTotals['proficiencyLevel'][$month] = $this->determineProficiencyLevel($yearTotals['epgfAverage'][$month]);

                $monthlyChampions = $yearLevelReports->filter(function ($report) use ($month) {
                    return \Carbon\Carbon::parse($report->created_at)->format('F') === $month;
                });

                $yearTotals['champion'][$month] = $monthlyChampions
                ->sortByDesc('champion_epgf_average')
                ->first()?->champion ?? null;
            }

            $yearLevelData['totals'] = $yearTotals;
            return $yearLevelData;
        });

        foreach ($months as $month) {
            $grandTotals['completionRate'][$month] = count($grandTotals['completionRate'][$month]) > 0
            ? round(array_sum($grandTotals['completionRate'][$month]) / count($grandTotals['completionRate'][$month]), 2)
            : 0;

            $grandTotals['epgfAverage'][$month] = count($grandTotals['epgfAverage'][$month]) > 0
            ? round(array_sum($grandTotals['epgfAverage'][$month]) / count($grandTotals['epgfAverage'][$month]), 2)
            : 0;

            $grandTotals['proficiencyLevel'][$month] = $this->determineProficiencyLevel($grandTotals['epgfAverage'][$month]);

            $monthlyChampions = $reports->filter(function ($report) use ($month) {
                return \Carbon\Carbon::parse($report->created_at)->format('F') === $month;
            });

            $grandTotals['champion'][$month] = $monthlyChampions
            ->sortByDesc('champion_epgf_average')
            ->first()?->champion ?? null;
        }

        return response()->json([
            'success' => true,
            'data' => $groupedData,
            'grandTotals' => $grandTotals,
        ]);
    }

    private function determineProficiencyLevel($epgfAverage)
    {
        $proficiencyLevels = [
            ["threshold" => 4.00, "level" => "Native/Bilingual"],
            ["threshold" => 3.00, "level" => "High Advanced"],
            ["threshold" => 2.50, "level" => "Advanced"],
            ["threshold" => 2.25, "level" => "High Proficient"],
            ["threshold" => 2.00, "level" => "Proficient"],
            ["threshold" => 1.75, "level" => "Low Proficient"],
            ["threshold" => 1.50, "level" => "High Developing"],
            ["threshold" => 1.25, "level" => "Low Developing"],
            ["threshold" => 1.00, "level" => "Emerging"],
            ["threshold" => 0.75, "level" => "High Acquisition"],
            ["threshold" => 0.50, "level" => "Low Acquisition"],
            ["threshold" => 0.00, "level" => "Beginning"]
        ];

        foreach ($proficiencyLevels as $current) {
            if ($epgfAverage >= $current["threshold"]) {
                return $current["level"];
            }
        }

        return "-";
    }

    public function getEieReporting(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');

        if (!$department || !$semester || !$schoolYear) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Validate school year format
        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months) {
            return $yearLevelReports->groupBy('program')->map(function ($programReports) use ($months) {
                $monthData = [];

                foreach ($months as $month) {
                    $monthData[$month] = [
                        'submitted' => null,
                        'completionRate' => null,
                        'epgfAverage' => null,
                        'proficiencyLevel' => null,
                        'champion' => null,
                        'champion_epgf_average' => null,
                        'champion_proficiency_level' => null,
                    ];
                }

                $firstReport = $programReports->first();
                $enrolledStudents = $firstReport->active_students;
                $assignedPOC = $firstReport->assigned_poc;

                foreach ($programReports as $report) {
                    $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                    if (in_array($monthName, $months)) {
                        $monthData[$monthName]['submitted'] =
                        is_null($monthData[$monthName]['submitted'])
                        ? $report->submitted
                        : $monthData[$monthName]['submitted'] + $report->submitted;

                        $monthData[$monthName]['completionRate'] =
                        is_null($monthData[$monthName]['completionRate'])
                        ? $report->completion_rate
                        : $monthData[$monthName]['completionRate'] + $report->completion_rate;

                        $monthData[$monthName]['epgfAverage'] =
                        is_null($monthData[$monthName]['epgfAverage'])
                        ? $report->epgf_average
                        : $monthData[$monthName]['epgfAverage'] + $report->epgf_average;
                        $monthData[$monthName]['proficiencyLevel'] = $this->determineProficiencyLevel($report->epgf_average);

                        if ($report->champion_epgf_average > $monthData[$monthName]['champion_epgf_average']) {
                            $monthData[$monthName]['champion'] = $report->champion;
                            $monthData[$monthName]['champion_epgf_average'] = $report->champion_epgf_average;
                            $monthData[$monthName]['champion_proficiency_level'] = $this->determineProficiencyLevel($report->champion_epgf_average);
                        }
                    }
                }

                return [
                    'program' => $firstReport->program,
                    'courseTitle' => $firstReport->course_title,
                    'assignedPOC' => $assignedPOC,
                    'enrolledStudents' => $enrolledStudents,
                    'monthData' => $monthData,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $groupedData,
        ]);
    }


    public function getEieReportingCollegePOC(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');
        $employeeId = $request->input('employee_id');

        // Validate input parameters
        if (!$department || !$semester || !$schoolYear || !$employeeId) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Validate school year format
        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        // Fetch the course codes from ImplementingSubjects based on the employee_id
        $courseCodes = ImplementingSubjects::where('employee_id', $employeeId)->pluck('course_code')->toArray();

        if (empty($courseCodes)) {
            return response()->json(['success' => false, 'message' => 'No courses found for the specified employee'], 404);
        }

        // Modify the query to filter by course_codes fetched above
        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->whereIn('course_code', $courseCodes) // Filter by course_code
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        // Define months based on semester
        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        // Group reports by year level and program, and calculate monthly statistics
        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months) {
            return $yearLevelReports->groupBy('program')->map(function ($programReports) use ($months) {
                // Initialize empty month data
                $monthData = array_fill_keys($months, [
                    'submitted' => 0,
                    'completionRate' => 0,
                    'epgfAverage' => 0,
                    'proficiencyLevel' => null,
                    'champion' => null,
                    'champion_epgf_average' => 0,
                    'champion_proficiency_level' => null,
                ]);

                $firstReport = $programReports->first();
                $enrolledStudents = $firstReport->active_students;
                $assignedPOC = $firstReport->assigned_poc;

                // Calculate monthly stats and determine champions
                foreach ($programReports as $report) {
                    $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                    if (in_array($monthName, $months)) {
                        $monthData[$monthName]['submitted'] += $report->submitted;
                        $monthData[$monthName]['completionRate'] += $report->completion_rate;
                        $monthData[$monthName]['epgfAverage'] += $report->epgf_average;
                        $monthData[$monthName]['proficiencyLevel'] = $this->determineProficiencyLevel($report->epgf_average);

                        // Update champion if a higher PGF average is found
                        if ($report->champion_epgf_average > $monthData[$monthName]['champion_epgf_average']) {
                            $monthData[$monthName]['champion'] = $report->champion;
                            $monthData[$monthName]['champion_epgf_average'] = $report->champion_epgf_average;
                            $monthData[$monthName]['champion_proficiency_level'] = $this->determineProficiencyLevel($report->champion_epgf_average);
                        }
                    }
                }

                return [
                    'program' => $firstReport->program,
                    'courseTitle' => $firstReport->course_title,
                    'assignedPOC' => $assignedPOC,
                    'enrolledStudents' => $enrolledStudents,
                    'monthData' => $monthData,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $groupedData,
        ]);
    }

    public function destroy($id)
    {
        $classList = ClassLists::findOrFail($id);

        // Only delete the class list, don't delete users
        $classList->delete();

        return response()->json(['message' => 'Class list deleted.']);
    }

    public function nullifyScores($id)
    {
        $students = Student::where('class_list_id', $id)->get();

        foreach ($students as $student) {
            $student->update([
                'pronunciation' => null,
                'grammar' => null,
                'fluency' => null,
                'epgf_average' => null,
                'proficiency_level' => null,
            ]);
        }

        return response()->json(['message' => 'Student scores nullified.']);
    }

    // Method to delete class lists
    public function deleteClassLists()
    {
        try {
            // Assumes ClassList model is not directly tied to the User accounts
            ClassLists::truncate(); // or ->delete() if you need to preserve some constraints

            return response()->json(['message' => 'Class lists deleted successfully.'], 200);
        } catch (\Exception $e) {
            \Log::error("Error deleting class lists: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete class lists.'], 500);
        }
    }

    // Nullify specific score columns in ClassLists
    public function nullifyClassListScores()
    {
        try {
            ClassLists::query()->update([
                'pronunciation' => null,
                'grammar' => null,
                'fluency' => null,
                'epgf_average' => null,
                'proficiency_level' => null,
            ]);

            return response()->json(['message' => 'Student score columns nullified successfully.'], 200);
        } catch (\Exception $e) {
            \Log::error("Error nullifying class list scores: " . $e->getMessage());
            return response()->json(['error' => 'Failed to nullify student scores.'], 500);
        }
    }

    // Nullify specific score columns in Implementing Subjects
    public function nullifyImplementingSubjectScores()
    {
        try {
            ImplementingSubjects::query()->update([
                'epgf_average' => null,
                'proficiency_level' => null,
                'completion_rate' => null,
            ]);

            return response()->json(['message' => 'Implementing subject scores nullified successfully.'], 200);
        } catch (\Exception $e) {
            \Log::error("Error nullifying implementing subject scores: " . $e->getMessage());
            return response()->json(['error' => 'Failed to nullify subject scores.'], 500);
        }
    }

    // Delete all Scorecard entries without affecting Implementing Subject scores
    public function deleteScorecard()
    {
        try {
            EieScorecardClassReport::truncate(); // Only clears the scorecards table

            return response()->json(['message' => 'Scorecards deleted successfully.'], 200);
        } catch (\Exception $e) {
            \Log::error("Error deleting scorecards: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete scorecards.'], 500);
        }
    }

    public function fetchFilteredReports(Request $request)
    {
        $request->validate([
            'course_code' => 'required|string',
            'semester' => 'required|string',
            'school_year' => 'required|string',
        ]);

        // Use query() to get GET parameters properly
        [$startYear, $endYear] = explode('/', $request->query('school_year'));

        $semesterMonths = [
            '1st Semester' => ['August', 'September', 'October', 'November', 'December'],
            '2nd Semester' => ['January', 'February', 'March', 'April', 'May'],
        ];

        $months = $semesterMonths[$request->query('semester')];

        try {
            $monthlyReports = [];

            foreach ($months as $month) {
                $monthIndex = date('m', strtotime($month));

                $year = in_array($month, ['January', 'February', 'March', 'April', 'May']) ? $endYear : $startYear;

                $startDate = "$year-$monthIndex-01";
                $endDate = date("Y-m-t", strtotime($startDate));

                $reports = EieReport::where('course_code', $request->query('course_code'))
                ->where('semester', $request->query('semester'))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get([
                    'eie_report_id',
                    'course_code',
                    'course_title',
                    'program',
                    'year_level',
                    'department',
                    'assigned_poc',
                    'completion_rate',
                    'epgf_average',
                    'created_at',
                    'updated_at',
                ]);

                $monthlyReports[] = [
                    'month' => $month,
                    'data' => $reports,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $monthlyReports,
            ]);
        } catch (\Exception $e) {
            \Log::error("Error fetching reports: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function getDashboardReportGrandTotals(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');

        if (!$department || !$semester || !$schoolYear) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Validate school year format
        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        // Initialize grandTotals with arrays instead of null
        $grandTotals = [
            'completionRate' => array_fill_keys($months, []),
            'epgfAverage' => array_fill_keys($months, []),
        ];

        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months, &$grandTotals) {
            $yearLevelData = [
                'completionRate' => array_fill_keys($months, []),
                'epgfAverage' => array_fill_keys($months, []),
            ];

            foreach ($yearLevelReports as $report) {
                $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                if (in_array($monthName, $months)) {
                    $reportCompletionRate = (!is_null($report->completion_rate)) ? $report->completion_rate : null;
                    $reportEpgfAverage = (!is_null($report->epgf_average)) ? $report->epgf_average : null;

                    if (!is_null($reportCompletionRate)) {
                        $yearLevelData['completionRate'][$monthName][] = $reportCompletionRate;
                        $grandTotals['completionRate'][$monthName][] = $reportCompletionRate;
                    }

                    if (!is_null($reportEpgfAverage)) {
                        $yearLevelData['epgfAverage'][$monthName][] = $reportEpgfAverage;
                        $grandTotals['epgfAverage'][$monthName][] = $reportEpgfAverage;
                    }
                }
            }

            // Calculate monthly averages
            foreach ($months as $month) {
                $yearLevelData['completionRate'][$month] = !empty($yearLevelData['completionRate'][$month])
                ? round(array_sum($yearLevelData['completionRate'][$month]) / count($yearLevelData['completionRate'][$month]), 2)
                : null;

                $yearLevelData['epgfAverage'][$month] = !empty($yearLevelData['epgfAverage'][$month])
                ? round(array_sum($yearLevelData['epgfAverage'][$month]) / count($yearLevelData['epgfAverage'][$month]), 2)
                : null;
            }

            return $yearLevelData;
        });

        // Calculate grand monthly averages
        foreach ($months as $month) {
            $grandTotals['completionRate'][$month] = !empty($grandTotals['completionRate'][$month])
            ? round(array_sum($grandTotals['completionRate'][$month]) / count($grandTotals['completionRate'][$month]), 2)
            : null;

            $grandTotals['epgfAverage'][$month] = !empty($grandTotals['epgfAverage'][$month])
            ? round(array_sum($grandTotals['epgfAverage'][$month]) / count($grandTotals['epgfAverage'][$month]), 2)
            : null;
        }

        return response()->json([
            'success' => true,
            'grandTotals' => $grandTotals,
        ]);
    }

    public function getDashboardReportYearTotals(Request $request) {
        // Extract the parameters from the request
        $department = $request->input('department');
        $semester = $request->input('semester');  // Trim any extra spaces
        $school_year = $request->input('schoolYear'); // Example: "2025/2026"

        \Log::info('YearTotals Received Parameters', [
            'department' => $request->input('department'),
            'semester' => $request->input('semester'),
            'school_year' => $request->input('schoolYear'),
        ]);

        // Validate the semester parameter
        $validSemesters = ['1st Semester', '2nd Semester']; // Define valid semesters
        if (!in_array($semester, $validSemesters)) {
            return response()->json([
                'error' => 'Invalid semester value. Please use a valid semester like 1st Semester, 2nd Semester, etc.'
            ], 400);
        }

        // Check if school_year is in the expected format (YYYY/YYYY)
        if (!$school_year || strpos($school_year, '/') === false) {
            return response()->json([
                'error' => 'Invalid school year format. Please use YYYY/YYYY format.'
            ], 400);
        }

        // Extract start year and end year from the school_year string
        list($startYear, $endYear) = explode('/', $school_year);

        // Check if the explode function successfully split the year values
        if (!isset($startYear) || !isset($endYear)) {
            return response()->json([
                'error' => 'Unable to parse school year. Please check the format.'
            ], 400);
        }

        // Prepare the start and end dates based on the semester
        if ($semester === '1st Semester') {
            $startDate = "{$startYear}-08-01"; // Start of 1st Semester (August)
            $endDate = "{$startYear}-12-31"; // End of 1st Semester (December)
        } elseif ($semester === '2nd Semester') {
            $startDate = "{$endYear}-01-01"; // use endYear
            $endDate = "{$endYear}-05-31";
        }

        // Fetch programs based on the department and school_year, no semester filter
        $programs = ClassLists::where('department', $department)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->pluck('program')
        ->unique()
        ->toArray();

        // Prepare an array to store the year-wise data
        $yearProgramTotals = [];

        // Iterate through each year level (1st Year, 2nd Year, etc.)
        for ($i = 1; $i <= 4; $i++) {
            // Convert the year level to a readable format
            $yearLevel = $i . ($i == 1 ? 'st' : ($i == 2 ? 'nd' : ($i == 3 ? 'rd' : 'th'))) . ' Year';

            // Initialize the program data for this year level
            $yearProgramTotals[$yearLevel] = [];

            // Iterate over the programs
            foreach ($programs as $program) {
                // Fetch the average completion rate for the program and year level
                $completionRate = EieReport::where('year_level', $yearLevel)
                ->where('program', $program)
                ->where('department', $department)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where(function ($query) use ($semester) {
                    if ($semester === '1st Semester') {
                        // 1st Semester: August to December
                        $query->whereMonth('created_at', '>=', 8)
                        ->whereMonth('created_at', '<=', 12);
                    } elseif ($semester === '2nd Semester') {
                        // 2nd Semester: January to May
                        $query->whereMonth('created_at', '>=', 1)
                        ->whereMonth('created_at', '<=', 5);
                    }
                })
                ->avg('completion_rate'); // Fetch the average completion rate for the program

                // Fetch the average epgf_average for the program
                $epgfAverage = ClassLists::where('year_level', $yearLevel)
                ->where('program', $program)
                ->where('department', $department)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where(function ($query) use ($semester) {
                    if ($semester === '1st Semester') {
                        $query->whereMonth('created_at', '>=', 8)
                        ->whereMonth('created_at', '<=', 12);
                    } elseif ($semester === '2nd Semester') {
                        $query->whereMonth('created_at', '>=', 1)
                        ->whereMonth('created_at', '<=', 5);
                    }
                })
                ->avg('epgf_average'); // Fetch the average epgf_average for the program

                // Store the results in the yearProgramTotals array
                $yearProgramTotals[$yearLevel][$program] = [
                    'completion_rate' => $completionRate ?? 0, // Set default value if completionRate is null
                    'epgf_average' => $epgfAverage ?? 0, // Set default value if epgfAverage is null
                ];
            }
        }

        // Return the final year program totals array
        return response()->json([
            'programs' => $programs,
            'yearProgramTotals' => $yearProgramTotals,
        ]);
    }

    public function getProficiencyDistribution(): JsonResponse
    {
        $totalStudents = ClassLists::count();

        $students = ClassLists::select('department', 'epgf_average')->get();

        $departments = [];

        foreach ($students as $student) {
            $dept = $student->department;

            // Treat null as 0
            $score = is_null($student->epgf_average) ? 0 : (float) $student->epgf_average;

            if (!isset($departments[$dept])) {
                $departments[$dept] = [
                    'total_score' => 0,
                    'student_count' => 0,
                    'Beginning' => 0,
                    'Developing' => 0,
                    'Approaching' => 0,
                    'Proficient' => 0,
                ];
            }

            // Add score and count every student (including 0 scores)
            $departments[$dept]['total_score'] += $score;
            $departments[$dept]['student_count']++;

            // Assign proficiency levels including zero scores
            if ($score < 1) {
                $departments[$dept]['Beginning']++;
            } elseif ($score >= 1 && $score < 2) {
                $departments[$dept]['Developing']++;
            } elseif ($score >= 2 && $score <= 2.5) {
                $departments[$dept]['Approaching']++;
            } elseif ($score > 2.5 && $score < 3) {
                // Handle gap: assign to Approaching or Proficient as per your rubric
                $departments[$dept]['Approaching']++;
            } elseif ($score >= 3 && $score <= 4) {
                $departments[$dept]['Proficient']++;
            } else {
                // Optional: handle scores outside expected range if any
            }
        }

        $result = [];
        foreach ($departments as $dept => $data) {
            $studentCount = $data['student_count'];
            $avgScore = $studentCount > 0 ? round($data['total_score'] / $studentCount, 2) : 0;

            $result[] = [
                'department' => $dept,
                'epgf_average' => $avgScore,
                'Beginning' => $studentCount > 0 ? round(($data['Beginning'] / $studentCount) * 100, 2) : 0,
                'Developing' => $studentCount > 0 ? round(($data['Developing'] / $studentCount) * 100, 2) : 0,
                'Approaching' => $studentCount > 0 ? round(($data['Approaching'] / $studentCount) * 100, 2) : 0,
                'Proficient' => $studentCount > 0 ? round(($data['Proficient'] / $studentCount) * 100, 2) : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'total_students' => $totalStudents,
            'data' => $result,
        ]);
    }

    public function getUniqueDepartments(): JsonResponse
    {
        $departments = ImplementingSubjects::pluck('department')->unique()->values();
        return response()->json([
            'success' => true,
            'departments' => $departments
        ]);
    }

    public function getFullUniqueDepartments(): JsonResponse
    {
        // Fetch unique combinations of department and full_department
        $uniqueDepartments = EIEHeads::select('department', 'full_department')
        ->distinct()
        ->get();

        return response()->json($uniqueDepartments);
    }

    public function getEieReportingLeadPOC(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');
        $employeeId = $request->input('employee_id');

        if (!$department || !$semester || !$schoolYear || !$employeeId) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        $leadPoc = LeadPOCs::where('employee_id', $employeeId)->first();

        if (!$leadPoc) {
            return response()->json(['success' => false, 'message' => 'No program found for the given employee_id'], 404);
        }

        $program = $leadPoc->program;

        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->where('program', $program)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->get();

        if ($reports->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No data found for the specified parameters'], 404);
        }

        $firstSem = ["August", "September", "October", "November", "December"];
        $secondSem = ["January", "February", "March", "April", "May"];
        $months = $semester === '1st Semester' ? $firstSem : $secondSem;

        $groupedData = $reports->groupBy('year_level')->map(function ($yearLevelReports) use ($months) {
            return $yearLevelReports->groupBy('program')->map(function ($programReports) use ($months) {
                // Initialize month data with sums and counts for averages
                $monthData = [];
                foreach ($months as $month) {
                    $monthData[$month] = [
                        'submitted' => 0,
                        'completionRate' => 0,
                        'completionCount' => 0,
                        'epgfAverage' => 0,
                        'epgfCount' => 0,
                        'proficiencyLevel' => null,
                        'champion' => null,
                        'champion_epgf_average' => 0,
                        'champion_proficiency_level' => null,
                    ];
                }

                $firstReport = $programReports->first();
                $enrolledStudents = $firstReport->active_students;
                $assignedPOC = $firstReport->assigned_poc;

                foreach ($programReports as $report) {
                    $monthName = \Carbon\Carbon::parse($report->created_at)->format('F');
                    if (in_array($monthName, $months)) {
                        $monthData[$monthName]['submitted'] += $report->submitted;

                        if ($report->completion_rate !== null) {
                            $monthData[$monthName]['completionRate'] += $report->completion_rate;
                            $monthData[$monthName]['completionCount']++;
                        }

                        if ($report->epgf_average !== null) {
                            $monthData[$monthName]['epgfAverage'] += $report->epgf_average;
                            $monthData[$monthName]['epgfCount']++;
                            $monthData[$monthName]['proficiencyLevel'] = $this->determineProficiencyLevel($report->epgf_average);
                        }

                        if ($report->champion_epgf_average > $monthData[$monthName]['champion_epgf_average']) {
                            $monthData[$monthName]['champion'] = $report->champion;
                            $monthData[$monthName]['champion_epgf_average'] = $report->champion_epgf_average;
                            $monthData[$monthName]['champion_proficiency_level'] = $this->determineProficiencyLevel($report->champion_epgf_average);
                        }
                    }
                }

                // Calculate averages after summing
                foreach ($months as $month) {
                    if ($monthData[$month]['completionCount'] > 0) {
                        $monthData[$month]['completionRate'] = round($monthData[$month]['completionRate'] / $monthData[$month]['completionCount'], 2);
                    } else {
                        $monthData[$month]['completionRate'] = null;
                    }
                    if ($monthData[$month]['epgfCount'] > 0) {
                        $monthData[$month]['epgfAverage'] = round($monthData[$month]['epgfAverage'] / $monthData[$month]['epgfCount'], 2);
                    } else {
                        $monthData[$month]['epgfAverage'] = null;
                        $monthData[$month]['proficiencyLevel'] = null;
                    }
                    unset($monthData[$month]['completionCount']);
                    unset($monthData[$month]['epgfCount']);
                }

                return [
                    'program' => $firstReport->program,
                    'courseTitle' => $firstReport->course_title,
                    'assignedPOC' => $assignedPOC,
                    'enrolledStudents' => $enrolledStudents,
                    'monthData' => $monthData,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $groupedData,
        ]);
    }

    public function getChampsdReport(Request $request)
    {
        $department = $request->input('department');
        $semester = $request->input('semester');
        $schoolYear = $request->input('schoolYear');

        if (!$department || !$semester || !$schoolYear) {
            return response()->json(['success' => false, 'message' => 'Invalid parameters'], 400);
        }

        // Validate school year format
        $years = explode('/', $schoolYear);
        if (count($years) != 2 || !is_numeric($years[0]) || !is_numeric($years[1])) {
            return response()->json(['success' => false, 'message' => 'Invalid school year format'], 400);
        }
        list($startYear, $endYear) = $years;

        $reports = EieReport::where('department', $department)
        ->where('semester', $semester)
        ->whereYear('created_at', '>=', (int)$startYear)
        ->whereYear('created_at', '<=', (int)$endYear)
        ->get();

        // Build year level map
        $studentIds = $reports->pluck('champion_student_id')->filter()->unique();
        $yearLevelsMap = [];

        $currentClassLists = ClassLists::whereIn('student_id', $studentIds)->get();
        foreach ($currentClassLists as $record) {
            $yearLevelsMap[$record->student_id] = $record->year_level;
        }

        $missingIds = $studentIds->diff(array_keys($yearLevelsMap));
        if ($missingIds->isNotEmpty()) {
            $historicalLists = HistoricalClassLists::whereIn('student_id', $missingIds)->get();
            foreach ($historicalLists as $record) {
                $yearLevelsMap[$record->student_id] = $record->year_level;
            }
        }

        // Attach year_level to each report
        $reports = $reports->map(function ($report) use ($yearLevelsMap) {
            $report->year_level = $yearLevelsMap[$report->champion_student_id] ?? 'Unknown';
            return $report;
        });

        $groupedReports = $reports->groupBy('year_level');

        // Define all possible year levels (customize as needed)
        $allYearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        $yearTotalChampions = [];

        foreach ($allYearLevels as $yearLevel) {
            $yearReports = $groupedReports->get($yearLevel, collect());

            if ($yearReports->isEmpty()) {
                $yearTotalChampions[$yearLevel] = null;
            } else {
                $championReport = $yearReports->sortByDesc('champion_epgf_average')->first();
                $studentId = data_get($championReport, 'champion_student_id');
                $stats = $this->getChampionStats($studentId);

                $fallbackEpgf = $stats['average_epgf'] ?? $championReport->champion_epgf_average;

                if (!empty($stats['times_won']) && $stats['times_won'] > 0) {
                    $yearTotalChampions[$yearLevel] = [
                        'champion' => $championReport->champion,
                        'student_id' => $studentId,
                        'epgf_average' => $fallbackEpgf !== null ? round($fallbackEpgf, 2) : null,
                        'times_won' => $stats['times_won'],
                    ];
                } else {
                    $yearTotalChampions[$yearLevel] = null;
                }
            }
        }

        // Filter valid champions for grand champion selection
        $validChampions = collect($yearTotalChampions)->filter(function ($champion) {
            return $champion && $champion['times_won'] > 0;
        });

        $grandChampion = null;
        if ($validChampions->isNotEmpty()) {
            $grandChampion = $validChampions->sortByDesc('epgf_average')->first();
        }

        return response()->json([
            'success' => true,
            'yearTotalChampions' => $yearTotalChampions,
            'grandChampion' => $grandChampion,
        ]);
    }

    /**
     * Helper method to count how many times a student has won in EieChampions
     */
    protected function getTimesWonCount($studentId)
    {
        if (!$studentId) {
            return 0;
        }

        return EieChampions::where('student_id', $studentId)->count();
    }

    protected function getChampionStats($studentId)
    {
        if (!$studentId) {
            return [
                'times_won' => 0,
                'average_epgf' => null,
            ];
        }

        $stats = EieChampions::where('student_id', $studentId)
        ->selectRaw('COUNT(*) as times_won, AVG(epgf_average) as average_epgf')
        ->first();

        return [
            'times_won' => (int) $stats->times_won,
            'average_epgf' => $stats->average_epgf ? round($stats->average_epgf, 2) : null,
        ];
    }

}
