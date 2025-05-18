<?php

namespace App\Http\Controllers;

use App\Models\ClassLists;
use App\Models\ImplementingSubjects;
use App\Models\HistoricalImplementingSubjects;
use App\Models\HistoricalClassLists;
use Illuminate\Http\Request;
use App\Models\EieScorecardClassReport;
use App\Models\HistoricalScorecard;
use Illuminate\Support\Facades\DB;

class EpgfScoreCardController extends Controller
{
    public function getCourseDetails(Request $request)
    {
        $course_code = $request->input('course_code'); // Get course_code from the request

        // Fetch the course details based on course_code from ImplementingSubjects table
        $course = ImplementingSubjects::where('course_code', $course_code)->first();

        if ($course) {
            return response()->json([
                'success' => true,
                'course_title' => $course->course_title,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }
    }

    public function getActiveStudents(Request $request)
    {
        $request->validate([
            'course_code' => 'required|string|exists:implementing_subjects,course_code',
        ]);

        $course_code = $request->input('course_code');

        // Fetch students with "Active" status and the provided course_code
        $students = ClassLists::where('status', 'Active')
        ->where('course_code', $course_code)
        ->get(['class_lists_id', 'firstname', 'lastname', 'year_level', 'student_id', 'department', 'program']);

        if ($students->isNotEmpty()) {
            return response()->json([
                'success' => true,
                'active_student_count' => $students->count(),
                                    'students' => $students,
            ]);
        } else {
            \Log::info("No active students found for course code: {$course_code}");
            return response()->json([
                'success' => false,
                'message' => 'No active students found',
            ], 404);
        }
    }

    public function storeStudentDataReports(Request $request)
    {
        $validatedData = $request->validate([
            'course_code' => 'required|string',
            'epgf_rubric_id' => 'required|integer',
            'student_id' => 'required|string',
            'department' => 'required|string',
            'task_title' => 'required|string',
            'type' => 'required|string',
            'comment' => 'nullable|string',
            'epgf_average' => 'required|numeric',
            'proficiency_level' => 'required|string',
            'program' => 'required|string',
            'active_students' => 'required|numeric',
            'course_title' => 'required|string',
            'year_level' => 'required|string',

            // Pronunciation
            'consistency_descriptor' => 'nullable|string',
            'consistency_rating' => 'nullable|numeric',
            'clarity_descriptor' => 'nullable|string',
            'clarity_rating' => 'nullable|numeric',
            'articulation_descriptor' => 'nullable|string',
            'articulation_rating' => 'nullable|numeric',
            'intonation_and_stress_descriptor' => 'nullable|string',
            'intonation_and_stress_rating' => 'nullable|numeric',
            'pronunciation_average' => 'nullable|numeric',

            // Grammar
            'accuracy_descriptor' => 'nullable|string',
            'accuracy_rating' => 'nullable|numeric',
            'clarity_of_thought_descriptor' => 'nullable|string',
            'clarity_of_thought_rating' => 'nullable|numeric',
            'syntax_descriptor' => 'nullable|string',
            'syntax_rating' => 'nullable|numeric',
            'grammar_average' => 'nullable|numeric',

            // Fluency
            'quality_of_response_descriptor' => 'nullable|string',
            'quality_of_response_rating' => 'nullable|numeric',
            'detail_of_response_descriptor' => 'nullable|string',
            'detail_of_response_rating' => 'nullable|numeric',
            'fluency_average' => 'nullable|numeric',
        ]);

        try {
            $identifier = [
                'student_id' => $validatedData['student_id'],
                'course_code' => $validatedData['course_code']
            ];

            // Scorecard: create or update
            $scorecard = EieScorecardClassReport::updateOrCreate(
                $identifier,
                array_merge($validatedData, [
                    'comment' => $validatedData['comment'] ?? 'No Comment',
                ])
            );

            // Historical Scorecard: create or update
            $historicalScorecard = HistoricalScorecard::updateOrCreate(
                $identifier,
                array_merge($validatedData, [
                    'comment' => $validatedData['comment'] ?? 'No Comment',
                ])
            );

            // ClassLists: update or create
            $classList = ClassLists::where('student_id', $validatedData['student_id'])
            ->where('course_code', $validatedData['course_code'])
            ->first();

            if ($classList) {
                $classList->update([
                    'pronunciation' => $validatedData['pronunciation_average'] ?? null,
                    'grammar' => $validatedData['grammar_average'] ?? null,
                    'fluency' => $validatedData['fluency_average'] ?? null,
                    'epgf_average' => $validatedData['epgf_average'],
                    'proficiency_level' => $validatedData['proficiency_level'],
                ]);
            } else {
                $classList = ClassLists::create([
                    'student_id' => $validatedData['student_id'],
                    'course_code' => $validatedData['course_code'],
                    'pronunciation' => $validatedData['pronunciation_average'] ?? null,
                    'grammar' => $validatedData['grammar_average'] ?? null,
                    'fluency' => $validatedData['fluency_average'] ?? null,
                    'epgf_average' => $validatedData['epgf_average'],
                    'proficiency_level' => $validatedData['proficiency_level'],
                ]);
            }

            // HistoricalClassLists: update or create
            $historicalClassList = HistoricalClassLists::where('student_id', $validatedData['student_id'])
            ->where('course_code', $validatedData['course_code'])
            ->first();

            if ($historicalClassList) {
                $historicalClassList->update([
                    'pronunciation' => $validatedData['pronunciation_average'] ?? null,
                    'grammar' => $validatedData['grammar_average'] ?? null,
                    'fluency' => $validatedData['fluency_average'] ?? null,
                    'epgf_average' => $validatedData['epgf_average'],
                    'proficiency_level' => $validatedData['proficiency_level'],
                ]);
            } else {
                $historicalClassList = HistoricalClassLists::create([
                    'student_id' => $validatedData['student_id'],
                    'course_code' => $validatedData['course_code'],
                    'pronunciation' => $validatedData['pronunciation_average'] ?? null,
                    'grammar' => $validatedData['grammar_average'] ?? null,
                    'fluency' => $validatedData['fluency_average'] ?? null,
                    'epgf_average' => $validatedData['epgf_average'],
                    'proficiency_level' => $validatedData['proficiency_level'],
                ]);
            }

            return response()->json([
                'message' => 'Scorecard, Historical Scorecard, Class data, and Historical Class data successfully stored or updated',
                'historicalScorecard' => $historicalScorecard,
                'scorecard' => $scorecard,
                'classList' => $classList,
                'historicalClassList' => $historicalClassList
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStudentCountByCourseCode(Request $request)
    {
        // Get the course_code from the request
        $course_code = $request->input('course_code');

        // Query to count students enrolled in the course with the given course_code
        $studentCount = ClassLists::where('course_code', $course_code)->count();

        return response()->json(['student_count' => $studentCount]);
    }

    public function getStudentCountByCourseCodeAndActive(Request $request)
    {
        // Get the course_code from the request
        $course_code = $request->input('course_code');

        if (!$course_code) {
            return response()->json(['error' => 'Course code is required'], 400);
        }

        // Query to count only active students enrolled in the course with the given course_code
        $studentCount = ClassLists::where('course_code', $course_code)
        ->where('status', 'active') // Assuming 'status' field marks students as active or inactive
        ->count();

        return response()->json(['student_count' => $studentCount]);
    }


    public function getClassAverageByCourseCode(Request $request)
    {
        $course_code = $request->input('course_code');

        // Query to get all the epgf_average values for the given course_code
        $averages = EieScorecardClassReport::where('course_code', $course_code)
        ->pluck('epgf_average'); // Assuming 'epgf_average' is the column storing the average

        if ($averages->isEmpty()) {
            return response()->json(['average' => 0, 'message' => 'No averages available for this course']);
        }

        // Calculate the average of the 'epgf_average' column
        $classAverage = $averages->avg(); // Get the average of the 'epgf_average'

        return response()->json(['average' => $classAverage]);
    }

    public function getEvaluatedCount(Request $request)
    {
        $course_code = $request->input('course_code');

        // Count students with evaluated status for the given course_code
        $evaluatedCount = DB::table('eie_scorecard_class_reports')
        ->where('course_code', $course_code)
        ->count();

        return response()->json(['evaluated_count' => $evaluatedCount]);
    }

    public function storeClassData(Request $request)
    {
        $validated = $request->validate([
            'course_code' => 'required|string',
            'completionRate' => 'required|numeric',
            'proficiencyLevel' => 'required|string',
            'enrolled_students' => 'required|integer',
            'active_students' => 'required|integer',
        ]);

        // Compute average treating null as 0
        $epgfAverage = HistoricalClassLists::where('course_code', $validated['course_code'])
        ->select(DB::raw('AVG(COALESCE(epgf_average, 0)) as avg_epgf'))
        ->value('avg_epgf');

        // If avg is zero, set it to null
        $epgfAverage = ($epgfAverage == 0) ? null : $epgfAverage;

        // Normalize fields
        $proficiencyLevel = ($validated['proficiencyLevel'] === 'Beginning') ? null : $validated['proficiencyLevel'];
        $completionRate = ($validated['completionRate'] == 0) ? null : $validated['completionRate'];

        // Shared data to update
        $dataToUpdate = [
            'epgf_average' => $epgfAverage,
            'completion_rate' => $completionRate,
            'proficiency_level' => $proficiencyLevel,
            'enrolled_students' => $validated['enrolled_students'],
            'active_students' => $validated['active_students'],
        ];

        // Update or create in ImplementingSubjects
        $implementingSubject = ImplementingSubjects::updateOrCreate(
            ['course_code' => $validated['course_code']],
            $dataToUpdate
        );

        // Update or create in HistoricalImplementingSubjects
        $historicalSubject = HistoricalImplementingSubjects::updateOrCreate(
            ['course_code' => $validated['course_code']],
            $dataToUpdate
        );

        return response()->json([
            'success' => true,
            'message' => 'Class data successfully saved or updated!',
            'data' => [
                'implementing_subject' => $implementingSubject,
                'historical_subject' => $historicalSubject,
                'epgf_average' => $epgfAverage,
            ],
        ]);
    }

    public function storeClassDataMonth(Request $request)
    {
        $validated = $request->validate([
            'course_code' => 'required|string',
            'completionRate' => 'required|numeric',
            'proficiencyLevel' => 'required|string',
            'enrolled_students' => 'required|integer',
            'active_students' => 'required|integer',
            'month' => 'required|string',
        ]);

        $courseCode = $validated['course_code'];
        $monthName = $validated['month'];

        // Calculate average but DO NOT store it in the DB
        $epgfAverage = HistoricalClassLists::where('course_code', $courseCode)
        ->whereRaw("MONTHNAME(created_at) = ?", [$monthName])
        ->select(DB::raw('AVG(COALESCE(epgf_average, 0)) as avg_epgf'))
        ->value('avg_epgf');

        $epgfAverage = ($epgfAverage == 0) ? null : $epgfAverage;

        $proficiencyLevel = ($validated['proficiencyLevel'] === 'Beginning') ? null : $validated['proficiencyLevel'];
        $completionRate = ($validated['completionRate'] == 0) ? null : $validated['completionRate'];

        // No data storage – Just return the calculated results
        return response()->json([
            'success' => true,
            'message' => 'Class data received successfully, but no data stored.',
            'data' => [
                'epgf_average' => $epgfAverage,
                'completion_rate' => $completionRate,
                'proficiency_level' => $proficiencyLevel,
                'enrolled_students' => $validated['enrolled_students'],
                'active_students' => $validated['active_students'],
            ],
        ]);
    }

    public function getSubmittedStudentIds()
    {
        $submittedIds = EieScorecardClassReport::pluck('student_id');
        return response()->json($submittedIds);
    }

    public function getByStudentId($student_id)
    {
        $reports = EieScorecardClassReport::where('student_id', $student_id)->get();
        return response()->json($reports);
    }
}
