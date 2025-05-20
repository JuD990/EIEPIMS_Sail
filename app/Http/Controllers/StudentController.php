<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\EpgfRubric;
use App\Models\EpgfPronunciation;
use App\Models\EpgfGrammar;
use App\Models\EpgfFluency;
use App\Models\ClassLists;
use App\Models\ImplementingSubjects;
use App\Models\EieScorecardClassReport;
use Carbon\Carbon;

class StudentController extends Controller
{
    public function getPerformanceSummaryRatings()
    {
        // Get active epgf_rubric_id
        $rubric = EpgfRubric::where('status', 'active')->first();

        if (!$rubric) {
            return response()->json(['error' => 'No active rubric found'], 404);
        }

        $epgfRubricId = $rubric->epgf_rubric_id;

        // Fetch ratings from the three tables
        $pronunciationRatings = EpgfPronunciation::where('epgf_pronunciation_id', $epgfRubricId)->pluck('rating');
        $grammarRatings = EpgfGrammar::where('epgf_grammar_id', $epgfRubricId)->pluck('rating');
        $fluencyRatings = EpgfFluency::where('epgf_fluency_id', $epgfRubricId)->pluck('rating');

        // Merge all ratings
        $allRatings = $pronunciationRatings->merge($grammarRatings)->merge($fluencyRatings);

        if ($allRatings->isEmpty()) {
            return response()->json(['error' => 'No ratings found'], 404);
        }

        // Get unique ratings and sort them from 4.0 to 0.0
        $uniqueRatings = $allRatings->unique()->sortDesc()->values();

        return response()->json([
            'ratings' => $uniqueRatings, // Send the sorted and unique ratings only
        ]);
    }

    public function getCurrentSubjects($student_id)
    {
        try {
            // Check if student has any records
            $hasRecord = EieScorecardClassReport::where('student_id', $student_id)->exists();

            if (!$hasRecord) {
                return response()->json(['message' => 'Student not found'], 404);
            }

            // Calculate average of epgf_average column for this student
            $average = EieScorecardClassReport::where('student_id', $student_id)
            ->avg('epgf_average');

            return response()->json([
                'student_id' => $student_id,
                'epgf_average' => round($average, 2)  // Rounded to 2 decimal places
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function getYearLevelOptions(Request $request)
    {
        $studentId = $request->query('student_id');

        if (!$studentId) {
            return response()->json(['error' => 'student_id is required'], 400);
        }

        $yearLevels = EieScorecardClassReport::where('student_id', $studentId)
        ->pluck('year_level')
        ->unique()
        ->values(); // Ensures numeric keys

        return response()->json($yearLevels);
    }

    public function getMonthlyPerformanceSummary(Request $request)
    {

        $studentId = $request->query('student_id');
        $yearLevel = $request->query('year_level');
        $semester = $request->query('semester');

        // Determine the months based on the semester
        if ($semester === '1st Semester') {
            $months = ['August', 'September', 'October', 'November', 'December'];
            $semesterStartMonth = 8;  // August
            $semesterEndMonth = 12;   // December
        } elseif ($semester === '2nd Semester') {
            $months = ['January', 'February', 'March', 'April', 'May'];
            $semesterStartMonth = 1;  // January
            $semesterEndMonth = 5;    // May
        } else {
            return response()->json(['error' => 'Invalid semester'], 400);
        }

        // Initialize array to store monthly performance data
        $performanceData = [];

        // Loop through each month to get the data
        foreach ($months as $index => $month) {
            $monthNumber = $semesterStartMonth + $index;  // Get the actual month number for query

            // Fetch data for the current month
            $data = EieScorecardClassReport::where('year_level', $yearLevel)
            ->where('student_id', $studentId)
            ->whereMonth('created_at', '=', $monthNumber)
            ->get();

            // If no data is found, set the month to null, else calculate the average epgf
            $epgfAverage = $data->isEmpty() ? null : $data->avg('epgf_average');

            // Add the data for this month
            $performanceData[$month] = [
                'epgf_average' => $epgfAverage
            ];
        }

        // Prepare the final response data
        $response = [
            'student_id' => $studentId,
            'semester' => $semester,
            'year_level' => $yearLevel,
            'months' => $performanceData
        ];

        return response()->json($response);
    }

    public function getPerformanceSummary(Request $request)
    {
        $studentId = $request->query('student_id');

        if (!$studentId) {
            return response()->json(['error' => 'Student ID is required'], 400);
        }

        // Define the year levels
        $yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        // Initialize the performance summary array
        $performanceSummary = [];

        // Loop through each year level and calculate the average epgf_average
        foreach ($yearLevels as $yearLevel) {
            // Fetch all data for the selected student and year level
            $data = EieScorecardClassReport::where('year_level', $yearLevel)
            ->where('student_id', $studentId)
            ->get();

            // If no data is found, set the epgf_average to null
            $epgfAverage = $data->isEmpty() ? null : $data->avg('epgf_average');

            // Add the data for this year level
            $performanceSummary[$yearLevel] = [
                'epgf_average' => $epgfAverage
            ];
        }

        // Prepare the response data
        $response = [
            'student_id' => $studentId,
            'performance_summary' => $performanceSummary
        ];

        return response()->json($response);
    }
}
