<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Students;
use App\Models\CollegePOCs;
use App\Models\LeadPOCs;
use App\Models\EIEHeads;
use App\Models\ESLadmins;
use App\Models\ClassLists;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentsImport;
use App\Imports\LeadPOCImport;
use App\Imports\HeadPOCImport;
use App\Imports\EslImport;
use App\Imports\CollegePOCImport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;

class UserManagement extends Controller
{
    public function getStudents()
    {
        try {
            $students = Students::all(); // Fetch all students
            return response()->json(['data' => $students], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch students', 'error' => $e->getMessage()], 500);
        }
    }

    public function getESLadmins()
    {
        try {
            $students = ESLadmins::all(); // Fetch all ESLadmins
            return response()->json(['data' => $students], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch students', 'error' => $e->getMessage()], 500);
        }
    }

    public function resetPasswordEslAdmin($employee_id)
    {
        // Find the ESL admin by employee_id
        $student = ESLadmins::where('employee_id', $employee_id)->first();

        // Check if the ESL admin exists
        if (!$student) {
            return response()->json([
                'message' => 'ESL not found'
            ], 404);
        }

        // Set the password to null
        $student->password = null;
        $student->save();

        return response()->json([
            'message' => 'Password successfully deleted for the ESL.'
        ], 200);
    }

    public function resetPassword($student_id)
    {
        // Find the student by student_id
        $student = Students::where('student_id', $student_id)->first();

        // Check if the student exists
        if (!$student) {
            return response()->json([
                'message' => 'Student not found'
            ], 404);
        }

        // Delete the password (set it to null)
        $student->password = null;
        $student->save();

        return response()->json([
            'message' => 'Password successfully deleted for the student.'
        ], 200);
    }

    public function resetPasswordCollegePOC($employee_id)
    {
        // Find the student by student_id
        $student = CollegePOCs::where('employee_id', $employee_id)->first();

        // Check if the student exists
        if (!$student) {
            return response()->json([
                'message' => 'College POC not found'
            ], 404);
        }

        // Delete the password (set it to null)
        $student->password = null;
        $student->save();

        return response()->json([
            'message' => 'Password successfully deleted for the student.'
        ], 200);
    }

    public function resetPasswordLeadPOC($employee_id)
    {
        // Find the student by student_id
        $student = LeadPOCs::where('employee_id', $employee_id)->first();

        // Check if the student exists
        if (!$student) {
            return response()->json([
                'message' => 'LeadPOC not found'
            ], 404);
        }

        // Delete the password (set it to null)
        $student->password = null;
        $student->save();

        return response()->json([
            'message' => 'Password successfully deleted for the student.'
        ], 200);
    }

    public function resetPasswordEIEHeadPOC($employee_id)
    {
        // Find the student by student_id
        $student = EIEHeads::where('employee_id', $employee_id)->first();

        // Check if the student exists
        if (!$student) {
            return response()->json([
                'message' => 'EIE Head not found'
            ], 404);
        }

        // Delete the password (set it to null)
        $student->password = null;
        $student->save();

        return response()->json([
            'message' => 'Password successfully deleted for the student.'
        ], 200);
    }

    public function storeStudents(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'studentId' => 'required|unique:students,student_id',
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email',
                'department' => 'required|string|max:255',
                'program' => 'required|string|max:255',
                'yearLevel' => 'required|string|max:255',
            ]);

            // Create and save the new student record
            $student = new Students();
            $student->student_id = $validated['studentId'];
            $student->firstname = $validated['firstName'];
            $student->middlename = $validated['middleName'] ?? null;
            $student->lastname = $validated['lastName'];
            $student->email = $validated['email'];
            $student->department = $validated['department'];
            $student->program = $validated['program'];
            $student->year_level = $validated['yearLevel'];
            $student->save();

            // Also store into Classlists table
            $classlist = new Classlists();
            $classlist->student_id = $student->student_id;
            $classlist->firstname = $student->firstname;
            $classlist->middlename = $student->middlename;
            $classlist->lastname = $student->lastname;
            $classlist->department = $student->department;
            $classlist->program = $student->program;
            $classlist->year_level = $student->year_level;
            $classlist->save();

            return response()->json([
                'message' => 'Student and classlist record added successfully',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error("Error adding student and classlist: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeCollegePOCs(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'employee_id' => 'required|unique:college_pocs,employee_id',
                'firstname' => 'required|string|max:100',
                'middlename' => 'nullable|string|max:100',
                'lastname' => 'required|string|max:100',
                'email' => 'required|email|unique:college_pocs,email',
                'department' => 'required|string|max:100',
            ]);

            // Create and save the new college POC record
            $student = new CollegePOCs();
            $student->employee_id = $validated['employee_id'];
            $student->firstname = $validated['firstname'];
            $student->middlename = $validated['middlename'] ?? null;
            $student->lastname = $validated['lastname'];
            $student->email = $validated['email'];
            $student->department = $validated['department'];
            $student->save();

            return response()->json([
                'message' => 'College POC added successfully',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Failed: ' . json_encode($e->errors())); // Debug
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error("Error adding College POC: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeLeadPOCs(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'employee_id' => 'required|unique:college_pocs,employee_id',
                'firstname' => 'required|string|max:100',
                'middlename' => 'nullable|string|max:100',
                'lastname' => 'required|string|max:100',
                'email' => 'required|email|unique:college_pocs,email',
                'department' => 'required|string|max:100',
            ]);

            // Create and save the new college POC record
            $student = new LeadPOCs();
            $student->employee_id = $validated['employee_id'];
            $student->firstname = $validated['firstname'];
            $student->middlename = $validated['middlename'] ?? null;
            $student->lastname = $validated['lastname'];
            $student->email = $validated['email'];
            $student->department = $validated['department'];
            $student->save();

            return response()->json([
                'message' => 'Lead POC added successfully',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log and return any other exception
            Log::error("Error adding a lead poc: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeEIEHeads(Request $request)
    {
        try {
            // Validate the incoming request
            $validated = $request->validate([
                'employeeId' => 'required|unique:eie_heads,employee_id',
                'firstName' => 'required|string|max:255',
                'middleName' => 'nullable|string|max:255',
                'lastName' => 'required|string|max:255',
                'email' => 'required|email|unique:eie_heads,email',
                'department' => 'required|string|max:255',
                'full_department' => 'required|string|max:255',
            ]);

            // Create and save the new student record
            $student = new EIEHeads();
            $student->employee_id = $validated['employeeId'];
            $student->firstname = $validated['firstName'];
            $student->middlename = $validated['middleName'] ?? null;
            $student->lastname = $validated['lastName'];
            $student->email = $validated['email'];
            $student->department = $validated['department'];
            $student->full_department = $validated['full_department'];
            $student->save();

            return response()->json([
                'message' => 'EIE Head POC added successfully',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log and return any other exception
            Log::error("Error adding a EIE Head POC: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeESLadmins(Request $request)
    {
        try {
            // Validate the incoming request using snake_case
            $validated = $request->validate([
                'employee_id' => 'required|unique:esl_admins,employee_id',
                'firstname' => 'required|string|max:255',
                'middlename' => 'nullable|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|email|unique:esl_admins,email',
                'role' => 'required|string|max:255',
            ]);

            // Create and save the new ESL admin
            $student = new ESLadmins();
            $student->employee_id = $validated['employee_id'];
            $student->firstname = $validated['firstname'];
            $student->middlename = $validated['middlename'] ?? null;
            $student->lastname = $validated['lastname'];
            $student->email = $validated['email'];
            $student->role = $validated['role'];
            $student->save();

            return response()->json([
                'message' => 'ESL added successfully',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error("Error adding ESL: " . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateEslAdmin (Request $request, $id)
    {
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'employee_id' => 'required|string|max:255',
            'email' => 'required|email',
            'role' => 'required|string|max:255',
        ]);

        $collegePOC = ESLadmins::find($id);

        if (!$collegePOC) {
            return response()->json(['message' => 'ESL not found'], 404);
        }

        $collegePOC->update($validatedData);

        return response()->json(['message' => 'ESL data updated successfully']);
    }

    public function updateStudents(Request $request, $id)
    {
        // Validate the incoming data without the unique constraint for email
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email',
            'student_id' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'program' => 'required|string|max:255',
            'year_level' => 'required|string|max:255',
        ]);

        // Find the student by ID
        $student = Students::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Update the student data in the Students table
        $student->update($validatedData);

        // Update related data in the Classlists table
        $classlist = Classlists::where('student_id', $student->student_id)->first();

        if ($classlist) {
            // Update all relevant fields in the Classlists table
            $classlist->update([
                'firstname' => $validatedData['firstname'],
                'middlename' => $validatedData['middlename'],
                'lastname' => $validatedData['lastname'],
                'email' => $validatedData['email'],
                'student_id' => $validatedData['student_id'],
                'department' => $validatedData['department'],
                'program' => $validatedData['program'],
                'year_level' => $validatedData['year_level'],
            ]);
        }

        // Return a success response
        return response()->json(['message' => 'Student and classlist data updated successfully']);
    }

    public function updateCollegePOCs(Request $request, $id)
    {
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'employee_id' => 'required|string|max:255',
            'email' => 'required|email',
            'department' => 'required|string|max:255',
        ]);

        $collegePOC = CollegePOCs::find($id);

        if (!$collegePOC) {
            return response()->json(['message' => 'College POC not found'], 404);
        }

        $collegePOC->update($validatedData);

        return response()->json(['message' => 'College POC data updated successfully']);
    }

    public function updateLeadPOCs(Request $request, $id)
    {
        // Validate the incoming data without the unique constraint for email
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email',
            'employee_id' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'program' => 'required|string|max:255',
        ]);

        // Find by employee_id
        $leadPOC = LeadPOCs::find($id);

        if (!$leadPOC) {
            return response()->json(['message' => 'Lead not POC found'], 404);
        }

        // Update the data
        $leadPOC->update($validatedData);

        // Return a success response
        return response()->json(['message' => 'Lead POC data updated successfully']);
    }

    public function updateHeadPOCs(Request $request, $id)
    {
        // Validate the incoming data without the unique constraint for email
        $validatedData = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email',
            'employee_id' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'full_department' => 'required|string|max:255',
        ]);

        // Find by employee_id
        $headPOC = EIEHeads::find($id);

        if (!$headPOC) {
            return response()->json(['message' => 'EIE Head not found'], 404);
        }

        // Update the data
        $headPOC->update($validatedData);

        // Return a success response
        return response()->json(['message' => 'EIE Head data updated successfully']);
    }

    public function deleteStudent($student_id)
    {
        // Find the student by student_id
        $student = Students::where('student_id', $student_id)->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Delete the student record
        $student->delete();

        // Return a success response
        return response()->json(['message' => 'Student deleted successfully']);
    }

    public function deleteCollegePOC($employee_id)
    {
        // Find the record by employee_id
        $headPOC = CollegePOCs::where('employee_id', $employee_id)->first();

        if (!$headPOC) {
            return response()->json(['message' => 'EIE Head not found'], 404);
        }

        // Delete the record
        $headPOC->delete();

        // Return a success response
        return response()->json(['message' => 'EIE Head deleted successfully']);
    }

    public function deleteLeadPOC($employee_id)
    {
        // Find the record by employee_id
        $headPOC = LeadPOCs::where('employee_id', $employee_id)->first();

        if (!$headPOC) {
            return response()->json(['message' => 'EIE Head not found'], 404);
        }

        // Delete the record
        $headPOC->delete();

        // Return a success response
        return response()->json(['message' => 'EIE Head deleted successfully']);
    }

    public function deleteHeadPOC($employee_id)
    {
        // Find the record by employee_id
        $headPOC = EIEHeads::where('employee_id', $employee_id)->first();

        if (!$headPOC) {
            return response()->json(['message' => 'EIE Head not found'], 404);
        }

        // Delete the record
        $headPOC->delete();

        // Return a success response
        return response()->json(['message' => 'EIE Head deleted successfully']);
    }

    public function deleteEslAdmin($employee_id)
    {
        // Find the record by employee_id
        $headPOC = ESLadmins::where('employee_id', $employee_id)->first();

        if (!$headPOC) {
            return response()->json(['message' => 'EIE Head not found'], 404);
        }

        // Delete the record
        $headPOC->delete();

        // Return a success response
        return response()->json(['message' => 'EIE Head deleted successfully']);
    }

    public function importStudents(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:10240',
        ]);

        try {
            // Import the CSV using the StudentsImport class
            Excel::import(new StudentsImport, $request->file('csv_file'));
            \Log::info('CSV import completed successfully');
            return response()->json(['message' => 'CSV Imported Successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('CSV Import Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error importing CSV: ' . $e->getMessage()], 500);
        }
    }

    public function importCollegePOCs(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:10240',
        ]);

        try {
            \Log::info('Validating file...');
            // Import the CSV using the CollegePOCImport class
            Excel::import(new CollegePOCImport, $request->file('csv_file'));
            \Log::info('CSV import completed successfully');
            return response()->json(['message' => 'CSV Imported Successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('CSV Import Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error importing CSV: ' . $e->getMessage()], 500);
        }
    }

    public function importLeadPOCs(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:10240',
        ]);

        try {
            \Log::info('Validating file...');
            // Import the CSV using the LeadPOCImport class
            Excel::import(new LeadPOCImport, $request->file('csv_file'));
            \Log::info('CSV import completed successfully');
            return response()->json(['message' => 'CSV Imported Successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('CSV Import Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error importing CSV: ' . $e->getMessage()], 500);
        }
    }

    public function importHeadPOCs(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:10240',
        ]);

        try {
            \Log::info('Validating file...');
            // Import the CSV using the HeadPOCImport class
            Excel::import(new HeadPOCImport, $request->file('csv_file'));
            \Log::info('CSV import completed successfully');
            return response()->json(['message' => 'CSV Imported Successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('CSV Import Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error importing CSV: ' . $e->getMessage()], 500);
        }
    }

    public function importESLadmins(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|mimes:csv,txt|max:10240',
        ]);

        try {
            \Log::info('Validating file...');
            // Import the CSV using the EslImport class
            Excel::import(new EslImport, $request->file('csv_file'));
            \Log::info('CSV import completed successfully');
            return response()->json(['message' => 'CSV Imported Successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('CSV Import Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error importing CSV: ' . $e->getMessage()], 500);
        }
    }

    public function fetchUserProfile(Request $request)
    {

        $request->validate([
            'role' => 'required|string',
            'student_id' => 'nullable|string',
            'employee_id' => 'nullable|string',
        ]);

        $role = $request->role;
        $studentId = $request->student_id;
        $employeeId = $request->employee_id;

        $user = null;

        switch ($role) {
            case 'Student':
                if (!$studentId) {
                    Log::warning("student_id missing for role Student");
                    return response()->json(['error' => 'student_id is required'], 400);
                }
                $user = Students::where('student_id', $studentId)
                ->where('role', 'Student')
                ->first();
                break;

            case 'College POC':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role College POC");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = CollegePOCs::where('employee_id', $employeeId)
                ->where('role', 'College POC')
                ->first();
                break;

            case 'Lead POC':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role Lead POC");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = LeadPOCs::where('employee_id', $employeeId)
                ->where('role', 'Lead POC')
                ->first();
                break;

            case 'EIE Head':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role EIE Head");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = EIEHeads::where('employee_id', $employeeId)
                ->where('role', 'EIE Head')
                ->first();
                break;

            case 'ESL Prime':
            case 'ESL Champion':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role {$role}");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = ESLadmins::where('employee_id', $employeeId)
                ->where('role', $role)
                ->first();
                break;

            default:
                Log::error("Invalid role provided: {$role}");
                return response()->json(['error' => 'Invalid role'], 400);
        }

        if (!$user) {
            Log::warning("User not found for role: {$role}, ID: " . ($studentId ?? $employeeId));
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json(['data' => $user]);
    }

    public function uploadProfilePicture(Request $request)
    {

        $request->validate([
          'profile_picture' => 'required|image|mimes:png|max:10240',

        ], [
            'profile_picture.required' => 'No file received.',
            'profile_picture.image' => 'File is not an image.',
            'profile_picture.mimes' => 'File must be a PNG.',
            'profile_picture.max' => 'File size exceeds 5MB.',
        ]);

        Log::info('Uploaded file info:', [
            'exists' => $request->hasFile('profile_picture'),
                  'original_name' => $request->file('profile_picture')?->getClientOriginalName(),
                  'mime_type' => $request->file('profile_picture')?->getMimeType(),
                  'size' => $request->file('profile_picture')?->getSize(),
        ]);

        $user = auth()->user();

        if (!$user) {
            Log::warning('uploadProfilePicture - Unauthorized access attempt.');
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $userId = $user->role === 'Student' ? $user->student_id : $user->employee_id;
        $filename = "{$userId}.png";
        $directory = public_path("assets/user_profile_pics/");
        $filePath = $directory . $filename;

        // Ensure directory exists
        if (!File::exists($directory)) {
            try {
                File::makeDirectory($directory, 0775, true);
                Log::info("uploadProfilePicture - Created directory: {$directory}");
            } catch (\Exception $e) {
                Log::error('uploadProfilePicture - Failed to create directory: ' . $e->getMessage());
                return response()->json(['message' => 'Error creating directory.'], 500);
            }
        }

        // Delete old profile picture
        if (File::exists($filePath)) {
            File::delete($filePath);
            Log::info("uploadProfilePicture - Deleted old profile picture: {$filePath}");
        }

        // Move new file
        try {
            $request->file('profile_picture')->move($directory, $filename);
            Log::info("uploadProfilePicture - Uploaded new profile picture: {$filePath}");
        } catch (\Exception $e) {
            Log::error('uploadProfilePicture - Failed to move file: ' . $e->getMessage());
            return response()->json(['message' => 'Error uploading file.'], 500);
        }

        $publicPath = asset("assets/user_profile_pics/{$filename}");

        return response()->json([
            'message' => 'Profile picture uploaded successfully.',
            'filepath' => $publicPath,
        ]);
    }

    public function uploadProfileDepartment(Request $request)
    {
        // Log the incoming request data
        Log::info('Upload Profile Department Request:', [
            'department' => $request->user()->department, // Log the department
        ]);

        $request->validate([
            'profile_department' => 'required|image|mimes:png|max:2048',
        ]);

        $user = auth()->user();
        $department = $user->department;

        if (!$department) {
            return response()->json(['message' => 'Department not found for user.'], 404);
        }

        // Convert department name to lowercase and remove spaces (optional)
        $filename = strtolower(str_replace(' ', '_', $department)) . '_department.png';
        $directory = public_path("assets/department_logo/");

        // Create the directory if it doesn't exist
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0775, true);
        }

        $filePath = $directory . $filename;

        // Delete existing department profile picture if it exists
        if (File::exists($filePath)) {
            File::delete($filePath);
        }

        // Move the uploaded file
        $request->file('profile_department')->move($directory, $filename);

        // Log successful upload
        Log::info('Department profile picture uploaded successfully.', [
            'user_id' => auth()->id(),
                  'filename' => $filename,
                  'filepath' => asset("assets/department_logo/{$filename}")
        ]);

        return response()->json([
            'message' => 'Department profile picture uploaded successfully.',
            'filepath' => asset("assets/department_logo/{$filename}"),
        ]);
    }

    public function updateUser(Request $request)
    {
        // Validate the incoming request data
        $request->validate([
            'role' => 'required|string',
            'student_id' => 'nullable|string',
            'employee_id' => 'nullable|string',
            'password' => 'nullable|string|min:6',
            'firstname' => 'nullable|string',
            'middlename' => 'nullable|string',
            'lastname' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $role = $request->role;
        $studentId = $request->student_id;
        $employeeId = $request->employee_id;

        $user = null;

        // Retrieve the user based on role and ID
        switch ($role) {
            case 'Student':
                if (!$studentId) {
                    Log::warning("student_id missing for role Student");
                    return response()->json(['error' => 'student_id is required'], 400);
                }
                $user = Students::where('student_id', $studentId)
                ->where('role', 'Student')
                ->first();
                break;

            case 'College POC':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role College POC");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = CollegePOCs::where('employee_id', $employeeId)
                ->where('role', 'College POC')
                ->first();
                break;

            case 'Lead POC':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role Lead POC");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = LeadPOCs::where('employee_id', $employeeId)
                ->where('role', 'Lead POC')
                ->first();
                break;

            case 'EIE Head':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role EIE Head");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = EIEHeads::where('employee_id', $employeeId)
                ->where('role', 'EIE Head')
                ->first();
                break;

            case 'ESL Prime':
            case 'ESL Champion':
                if (!$employeeId) {
                    Log::warning("employee_id missing for role {$role}");
                    return response()->json(['error' => 'employee_id is required'], 400);
                }
                $user = ESLadmins::where('employee_id', $employeeId)
                ->where('role', $role)
                ->first();
                break;

            default:
                Log::error("Invalid role provided: {$role}");
                return response()->json(['error' => 'Invalid role'], 400);
        }

        if (!$user) {
            Log::warning("User not found for role: {$role}, ID: " . ($studentId ?? $employeeId));
            return response()->json(['error' => 'User not found'], 404);
        }

        // Log incoming request
        Log::info("Request data: ", $request->all());

        if (!empty($request->password)) {
            $newPassword = trim($request->password);
            $idToCheck = $role === 'Student' ? $studentId : $employeeId;

            if ($newPassword === $idToCheck) {
                return response()->json(['error' => 'New password cannot be the same as your ID.'], 400);
            }

            if (!empty($user->password) && Hash::check($newPassword, $user->password)) {
                return response()->json(['error' => 'Same as current password. Pick a new one!'], 400);
            }

            $hashed = Hash::make($newPassword);
            Log::info("Hash being saved for {$user->email}: $hashed");

            $user->password = $hashed;
        }

        // Update other user details if provided
        if ($request->has('firstname')) {
            $user->firstname = $request->firstname;
        }
        if ($request->has('middlename')) {
            $user->middlename = $request->middlename;
        }
        if ($request->has('lastname')) {
            $user->lastname = $request->lastname;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }

        // Save the updated user information
        $user->save();

        return response()->json($user, 200);
    }
}
