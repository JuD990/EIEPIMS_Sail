<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\MasterClassListImport;
use App\Models\MasterClassList;
use App\Models\EIEHeads;
use App\Models\ClassLists;
use App\Models\EieDiagnosticReport;
use Maatwebsite\Excel\Facades\Excel;

class MasterClassListController extends Controller
{
    public function index($employeeId)
    {
        // Ensure the employee ID is valid
        if (!$employeeId) {
            return response()->json(['error' => 'Employee ID is required'], 400);
        }

        // Find the department head by employee ID
        $head = EIEHeads::where('employee_id', $employeeId)->first();

        if (!$head) {
            return response()->json(['error' => 'Department not found'], 404);
        }

        // Retrieve the department associated with this employee
        $department = $head->department;

        // Log for debugging
        \Log::info("Department for employee $employeeId: $department");

        // Fetch students matching either:
        // 1. ACT 2nd Year & Graduating
        // 2. 4th Year & Graduating
        $data = ClassLists::where('department', $department)
        ->where('candidate_for_graduating', 'Yes')
        ->where('status', 'Active')
        ->where(function ($query) {
            $query->where(function ($q) {
                $q->where('program', 'ACT')
                ->where('year_level', '2nd Year');
            })->orWhere('year_level', '4th Year');
        })
        ->get();

        if ($data->isEmpty()) {
            \Log::info("No data found for department: $department");
            return response()->json(['error' => 'No data found for this department'], 404);
        }

        return response()->json($data);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt|max:2048',
        ]);

        Excel::import(new MasterClassListImport, $request->file('file'));

        return response()->json(['message' => 'MasterClassList imported successfully']);
    }

    public function getStudents(Request $request)
    {
        $department = $request->input('department');
        $yearLevel = $request->input('yearLevel');

        // Validate the inputs
        $request->validate([
            'department' => 'required|string',
            'yearLevel' => 'required|string',
        ]);

        // Base query: filter by department, year level, and status = 'No Show'
        $query = ClassLists::where('department', $department)
        ->where('year_level', $yearLevel)
        ->where('status', 'Active');

        // Additional condition: if year level is 4th Year, also require candidate_for_graduating = 'Yes'
        if (strtolower($yearLevel) === '4th year') {
            $query->where('candidate_for_graduating', 'Yes');
        }

        $students = $query->get();

        return response()->json($students);
    }

    public function getDepartments()
    {
        $departments = ClassLists::pluck('department')->unique()->values();

        // Ensure it's an array before returning
        return response()->json($departments->toArray());
    }

    public function getSchoolYears()
    {
        // Extract unique years from the created_at column using Eloquent
        $schoolYears = EieDiagnosticReport::selectRaw("DISTINCT CONCAT(YEAR(created_at), '/', YEAR(created_at) + 1) AS school_year")
        ->orderBy('school_year', 'desc')
        ->pluck('school_year');

        // Fallback if no records are found
        if ($schoolYears->isEmpty()) {
            $currentYear = date('Y');
            $schoolYears = collect([($currentYear - 1 . "/$currentYear")]);
        }

        return response()->json($schoolYears);
    }

    public function updateMasterClassList(Request $request, $id)
    {
        // Find the record or fail with 404 if not found
        $record = MasterClassList::findOrFail($id);

        // Update the record with the new values
        $record->update([
            'firstname' => $request->firstname,
            'middlename' => $request->middlename,
            'lastname' => $request->lastname,
            'department' => $request->department,
            'program' => $request->program,
            'classification' => $request->classification,
            'year_level' => $request->year_level,
            'status' => $request->status,
            'gender' => $request->gender,
            'reason_for_shift_or_drop' => $request->reason_for_shift_or_drop,
            'candidate_for_graduating' => $request->candidate_for_graduating,
        ]);

        // Return the updated record as a JSON response
        return response()->json($record);
    }

    public function updateCandidate(Request $request, $id)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'candidate_for_graduating' => 'required|in:Yes,No',
        ]);

        // Find the record
        $record = ClassLists::findOrFail($id);

        // Update only the candidate_for_graduating field
        $record->candidate_for_graduating = $validated['candidate_for_graduating'];
        $record->save();

        return response()->json($record, 200);
    }

    public function getTopEPGF(Request $request)
    {
        $employeeId = $request->input('employee_id');

        if (!$employeeId) {
            return response()->json(['message' => 'Employee ID is required.'], 400);
        }

        // Get the department of the EIE head
        $eieHead = EIEHeads::where('employee_id', $employeeId)->first();

        if (!$eieHead) {
            return response()->json(['message' => 'EIE Head not found.'], 404);
        }

        $department = $eieHead->department;

        // Fetch all students with epgf_average > 0 in that department, ordered by year level and epgf_average
        $students = ClassLists::where('epgf_average', '>', 0)
        ->where('department', $department)
        ->orderBy('year_level')
        ->orderByDesc('epgf_average')
        ->get();

        // Group by year_level and take top 3 for each
        $topStudentsByYear = $students->groupBy('year_level')->map(function ($group) {
            return $group->take(3)->values();
        });

        return response()->json($topStudentsByYear);
    }
}
