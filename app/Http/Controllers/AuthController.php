<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Students;
use App\Models\CollegePOCs;
use App\Models\LeadPOCs;
use App\Models\EIEHeads;
use App\Models\ESLadmins;
use App\Models\ClassLists;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Session;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        try {
            // Validate the incoming request
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
                'user_type' => 'required|string|in:students,college_pocs,lead_pocs,eie_heads,esl_prime,esl_champion',
            ]);

            $email = $request->input('email');
            $password = trim($request->input('password'));
            $userType = $request->input('user_type');

            $user = $this->getUserByType($userType, $email);

            Log::debug("Login attempt: Email - " . $email . " User Type - " . $userType);

            if (!$user) {
                Log::warning("Login failed: User not found for email: $email and user type: $userType");
                return response()->json(['error' => 'User not found'], 404);
            }

            if (!$this->checkPassword($user, $password)) {
                Log::warning("Login failed: Invalid credentials", [
                    'email' => $email,
                    'user_type' => $userType,
                ]);
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $token = $user->createToken('authToken')->plainTextToken;

            $sessionId = Str::uuid();
            Session::create([
                'id' => $sessionId,
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'payload' => json_encode($user),
                'last_activity' => time(),
            ]);

            return response()->json([
                'token' => $token,
                'user' => $user,
                'session_id' => $sessionId,
                'employee_id' => $user->employee_id ?? null,
                'student_id' => $user->student_id ?? null,
            ], 200);
        } catch (\Exception $e) {
            Log::error("Login Error: " . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Check if the provided password is correct.
     */
    private function checkPassword($user, $password)
    {
        // If the user has a password, check it against the hash
        if (!empty($user->password)) {
            $isMatch = Hash::check($password, $user->password);
            return $isMatch;
        }

        // If the password field is empty, use student_id or employee_id for fallback
        if (empty($user->password)) {
            if (isset($user->student_id) && trim($user->student_id) === trim($password)) {
                return true;
            }

            if (isset($user->employee_id) && trim($user->employee_id) === trim($password)) {
                return true;
            }
        }

        // If no match, return false
        return false;
    }

    /**
     * Get the user by their type and email.
     */
    private function getUserByType($userType, $email)
    {
        switch ($userType) {
            case 'students':
                return Students::where('email', $email)->first();
            case 'college_pocs':
                return CollegePOCs::where('email', $email)->first();
            case 'lead_pocs':
                return LeadPOCs::where('email', $email)->first();
            case 'eie_heads':
                return EIEHeads::where('email', $email)->first();
            case 'esl_prime':
                return ESLadmins::where('email', $email)->first();
            case 'esl_champion':
                return ESLadmins::where('email', $email)->first();
            default:
                return null;
        }
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        // Delete the user's current access token
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function getUserInfo(Request $request)
    {
        $user = $request->user();
        $studentId = $user->student_id ?? null;
        $yearLevel = null;

        if ($user->role === 'student' && $studentId) {
            // Fetch latest year_level from ClassLists
            $classList = ClassLists::where('student_id', $studentId)
            ->orderByDesc('updated_at')
            ->first();

            if ($classList) {
                $yearLevel = $classList->year_level;
            }

            // If ClassLists does not have year_level, fetch from Students
            if (!$yearLevel) {
                $student = Students::where('student_id', $studentId)->first();
                if ($student) {
                    $yearLevel = $student->year_level;
                    Log::info("Year Level Found in Students Table", ['student_id' => $studentId, 'year_level' => $yearLevel]);
                } else {
                    Log::info("No year_level found for student_id: " . $studentId);
                }
            }
        }

        return response()->json([
            'name' => $user->firstname . ' ' . $user->lastname,
            'role' => $user->role ?? $request->input('user_type'),
            'employee_id' => $user->employee_id,
            'department' => $user->department ?? '',
            'student_id' => $studentId,
            'year_level' => $yearLevel ?? '',
        ]);
    }

}
