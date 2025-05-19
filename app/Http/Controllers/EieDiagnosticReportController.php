<?php

namespace App\Http\Controllers;

use App\Models\EieDiagnosticReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\MasterClassList;
use App\Models\ESLadmins;
use Carbon\Carbon;
use App\Models\DiagnosedGraduate;

class EieDiagnosticReportController extends Controller
{
    public function storeNonGradData(Request $request)
    {
        try {
            // Validate the incoming data
            $data = $request->validate([
                'name' => 'required|string',
                'student_id' => 'nullable|string',
                'date_of_interview' => 'nullable|date',
                'time_of_interview' => 'nullable',
                'venue' => 'nullable|string',
                'department' => 'required|string',
                'program' => 'nullable|string',
                'interviewer' => 'nullable|string',
                'year_level' => 'nullable|string',
                // Ratings fields
                'consistency_descriptor' => 'nullable|string',
                'consistency_rating' => 'nullable|numeric',
                'clarity_descriptor' => 'nullable|string',
                'clarity_rating' => 'nullable|numeric',
                'articulation_descriptor' => 'nullable|string',
                'articulation_rating' => 'nullable|numeric',
                'intonation_and_stress_descriptor' => 'nullable|string',
                'intonation_and_stress_rating' => 'nullable|numeric',
                'pronunciation_average' => 'nullable|numeric',
                'accuracy_descriptor' => 'nullable|string',
                'accuracy_rating' => 'nullable|numeric',
                'clarity_of_thought_descriptor' => 'nullable|string',
                'clarity_of_thought_rating' => 'nullable|numeric',
                'syntax_descriptor' => 'nullable|string',
                'syntax_rating' => 'nullable|numeric',
                'grammar_average' => 'nullable|numeric',
                'quality_of_response_descriptor' => 'nullable|string',
                'quality_of_response_rating' => 'nullable|numeric',
                'detail_of_response_descriptor' => 'nullable|string',
                'detail_of_response_rating' => 'nullable|numeric',
                'fluency_average' => 'nullable|numeric',
                'average_pgf_rating' => 'nullable|numeric',
                'pgf_specific_remarks' => 'nullable|string',
                'school_year_highlight' => 'nullable|string',
                'school_year_lowlight' => 'nullable|string',
                'spark_highlight' => 'nullable|string',
                'spark_lowlight' => 'nullable|string',
                'usage_in_school_online' => 'nullable|string',
                'usage_offline' => 'nullable|string',
                'support_needed' => 'nullable|string',
                'show_status' => 'nullable|string|max:50',
            ]);

            // Create the report using validated data
            $report = EieDiagnosticReport::create($data);

            // If student_id and show_status are provided, update MasterClassList
            if (!empty($data['student_id']) && isset($data['show_status'])) {
                MasterClassList::where('student_id', $data['student_id'])
                ->update(['status' => $data['show_status']]);
            }

            return response()->json([
                'message' => 'Report saved successfully.',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Error saving diagnostic report: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to save report.',
                'error' => $e->getMessage(),
                                    'error_code' => $e->getCode(),
            ], 500);
        }
    }

    public function getFirstYearReports(Request $request)
    {
        try {

            [$startYear, $endYear] = explode('/', $request->school_year);
            $startDate = Carbon::createFromDate($startYear, 1, 1)->startOfDay();
            $endDate = Carbon::createFromDate($endYear, 12, 31)->endOfDay();

            // Fetch reports from the same table using 'year_level'
            $reports = EieDiagnosticReport::where('show_status', $request->status)
            ->where('department', $request->department)
            ->where('year_level', '1st Year')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

            // Format time_of_interview to 12-hour format
            $reports->each(function ($report) {
                if ($report->time_of_interview) {
                    $report->time_of_interview = Carbon::parse($report->time_of_interview)->format('g:i A');
                }
            });

            return response()->json($reports);
        } catch (\Throwable $e) {
            \Log::error('Error fetching reports:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Server error.'], 500);
        }
    }


    public function storeGradData(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'student_id' => 'nullable|string|max:255',
            'date_of_interview' => 'nullable|date',
            'time_of_interview' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'department' => 'required|string|max:255',
            'program' => 'nullable|string|max:255',
            'interviewer' => 'nullable|string|max:255',
            'year_level' => 'required|string|max:255',

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

            // Remarks
            'pgf_specific_remarks' => 'nullable|string',
            'school_year_highlight' => 'nullable|string',
            'school_year_lowlight' => 'nullable|string',
            'reason_for_enrolling' => 'nullable|string',
            'after_graduation_plans' => 'nullable|string',

            // English Usage
            'transactions_with_employees_rating' => 'nullable|numeric',
            'transactions_with_employees_explanation' => 'nullable|string',
            'employee_student_conversations_rating' => 'nullable|numeric',
            'employee_student_conversations_explanation' => 'nullable|string',
            'student_visitor_conversations_rating' => 'nullable|numeric',
            'student_visitor_conversations_explanation' => 'nullable|string',
            'classes_rating' => 'nullable|numeric',
            'classes_explanation' => 'nullable|string',
            'university_activities_rating' => 'nullable|numeric',
            'university_activities_explanation' => 'nullable|string',
            'meetings_and_workshops_rating' => 'nullable|numeric',
            'meetings_and_workshops_explanation' => 'nullable|string',
            'written_communications_rating' => 'nullable|numeric',
            'written_communications_explanation' => 'nullable|string',
            'consultation_sessions_rating' => 'nullable|numeric',
            'consultation_sessions_explanation' => 'nullable|string',
            'informal_conversations_rating' => 'nullable|numeric',
            'informal_conversations_explanation' => 'nullable|string',
            'external_representation_rating' => 'nullable|numeric',
            'external_representation_explanation' => 'nullable|string',
            'native_language_guidance_rating' => 'nullable|numeric',
            'native_language_guidance_explanation' => 'nullable|string',
            'clarify_with_native_language_rating' => 'nullable|numeric',
            'clarify_with_native_language_explanation' => 'nullable|string',
            'help_restate_context_rating' => 'nullable|numeric',
            'help_restate_context_explanation' => 'nullable|string',
            'immersive_program_rating' => 'nullable|numeric',
            'immersive_program_explanation' => 'nullable|string',
            'help_correct_english_usage_rating' => 'nullable|numeric',
            'help_correct_english_usage_explanation' => 'nullable|string',
        ]);

        $diagnosedGraduate = DiagnosedGraduate::create($validatedData);

        return response()->json([
            'message' => 'Data saved successfully.',
            'data' => $diagnosedGraduate
        ], 201);
    }


    // Fetch 4th Year reports
    public function getFourthYearReports(Request $request)
    {
        try {

            [$startYear, $endYear] = explode('/', $request->school_year);
            $startDate = Carbon::createFromDate($startYear, 1, 1)->startOfDay();
            $endDate = Carbon::createFromDate($endYear, 12, 31)->endOfDay();

            // Fetch reports from the same table using 'year_level'
            $reports = DiagnosedGraduate::where('show_status', $request->status)
            ->where('department', $request->department)
            ->where('year_level', '4th Year')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

            // Format time_of_interview to 12-hour format
            $reports->each(function ($report) {
                if ($report->time_of_interview) {
                    $report->time_of_interview = Carbon::parse($report->time_of_interview)->format('g:i A');
                }
            });

            return response()->json($reports);
        } catch (\Throwable $e) {
            \Log::error('Error fetching reports:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Server error.'], 500);
        }
    }

    public function getFullName($employee_id)
    {
        // Look for the employee based on employee_id, not the primary key
        $employee = ESLadmins::where('employee_id', $employee_id)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        // Concatenate first name, middle name (if any), and last name
        $full_name = $employee->firstname . ' ' . ($employee->middlename ? $employee->middlename . ' ' : '') . $employee->lastname;

        return response()->json([
            'full_name' => $full_name
        ]);
    }
}
