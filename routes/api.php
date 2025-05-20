<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImplementingSubjectController;
use App\Http\Controllers\CollegePOCController;
use App\Http\Controllers\ClassListController;
use App\Http\Controllers\MasterClassListController;
use App\Http\Controllers\EpgfScoreCardController;
use App\Http\Controllers\EpgfRubricController;
use App\Http\Controllers\UserManagement;
use App\Http\Controllers\HistoricalScorecardController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\EieReportController;
use App\Http\Controllers\EieDiagnosticReportController;

Route::get('/reports/first-year-diagnostic-report', [EieDiagnosticReportController::class, 'getFirstYearReports']);
Route::get('/reports/fourth-year-diagnostic-report', [EieDiagnosticReportController::class, 'getFourthYearReports']);

Route::post('/eie-diagnostic-non-grad-reports', [EieDiagnosticReportController::class, 'storeNonGradData']);
Route::post('/eie-diagnostic-grad-reports', [EieDiagnosticReportController::class, 'storeGradData']);
Route::get('esl/employee/{employee_id}', [EieDiagnosticReportController::class, 'getFullName']);

Route::post('/eie-reports/store-or-update', [EieReportController::class, 'storeOrUpdatePrograms']);
Route::get('/dashboard-report', [EieReportController::class, 'getDashboardReport']);
Route::get('/dashboard-assigned-report', [EieReportController::class, 'getDashboardAssignedReport']);
Route::get('/eie-report', [EieReportController::class, 'getEieReporting']);
Route::get('/eie-assigned-report', [EieReportController::class, 'getEieReportingCollegePOC']);
Route::get('/eie-assigned-program-report', [EieReportController::class, 'getEieReportingLeadPOC']);

Route::get('/dashboard-report-grand-totals', [EieReportController::class, 'getDashboardReportGrandTotals']);
Route::get('/dashboard-report-year-totals', [EieReportController::class, 'getDashboardReportYearTotals']);
Route::get('/fetch-filtered-eie-reports', [EieReportController::class, 'fetchFilteredReports']);
Route::get('/department-eie-reports', [EieReportController::class, 'getDepartmentReport']);
Route::get('/get-departments', [EieReportController::class, 'getUniqueDepartments']);
Route::get('/get-full-departments', [EieReportController::class, 'getFullUniqueDepartments']);
Route::get('/department-proficiency-distribution', [EieReportController::class, 'getProficiencyDistribution']);
Route::get('/champions-report', [EieReportController::class, 'getChampsdReport']);

// Delete Data Settings
Route::delete('/data-settings/class-lists', [EieReportController::class, 'deleteClassLists']);
Route::put('/data-settings/class-lists/nullify-scores', [EieReportController::class, 'nullifyClassListScores']);
Route::put('/data-settings/implementing-subjects/nullify-scores', [EieReportController::class, 'nullifyImplementingSubjectScores']);
Route::delete('/data-settings/scorecard', [EieReportController::class, 'deleteScorecard']);


Route::get('/performance-summary-rating', [StudentController::class, 'getPerformanceSummaryRatings']);
Route::get('/current-subjects/{student_id}', [StudentController::class, 'getCurrentSubjects']);
Route::get('/student-year-level-options', [StudentController::class, 'getYearLevelOptions']);
Route::get('/get-monthly-performance-data', [StudentController::class, 'getMonthlyPerformanceSummary']);
Route::get('/get-performance-summary', [StudentController::class, 'getPerformanceSummary']);

Route::get('/certificate/{id}', [CertificateController::class, 'getCertificateData']);
Route::get('/diagnostics-students', [CertificateController::class, 'getDiagnosticsStudents']);
Route::post('/upload-department-logo', [CertificateController::class, 'uploadDepartmentLogo']);

//Student
Route::get('/get-courses', [HistoricalScorecardController::class, 'getCoursesByStudent']);
Route::get('/get-course-details', [HistoricalScorecardController::class, 'getCourseDetails']);


// User Management
Route::get('/students', [UserManagement::class, 'getStudents']);
Route::get('/esl-admins', [UserManagement::class, 'getESLadmins']);
Route::post('/store-students', [UserManagement::class, 'storeStudents']);
Route::post('/store-college-poc', [UserManagement::class, 'storeCollegePOCs']);
Route::post('/store-lead-poc', [UserManagement::class, 'storeLeadPOCs']);
Route::post('/store-head-poc', [UserManagement::class, 'storeEIEHeads']);
Route::post('/store-esl-admins', [UserManagement::class, 'storeESLadmins']);
Route::put('/update-students/{id}', [UserManagement::class, 'updateStudents']);
Route::put('/update-collge-poc/{id}', [UserManagement::class, 'updateCollegePOCs']);
Route::put('/update-lead-poc/{id}', [UserManagement::class, 'updateLeadPOCs']);
Route::put('/update-head-poc/{id}', [UserManagement::class, 'updateHeadPOCs']);
Route::put('/update-esl-admins/{id}', [UserManagement::class, 'updateEslAdmin']);
Route::post('/import-students', [UserManagement::class, 'importStudents']);
Route::post('/import-college-poc', [UserManagement::class, 'importCollegePOCs']);
Route::post('/import-lead-poc', [UserManagement::class, 'importLeadPOCs']);
Route::post('/import-head-poc', [UserManagement::class, 'importHeadPOCs']);
Route::post('/import-esl-admins', [UserManagement::class, 'importESLadmins']);

//Delete Accounts
Route::delete('/delete-students/{student_id}', [UserManagement::class, 'deleteStudent']);
Route::delete('/delete-college-pocs/{employee_id}', [UserManagement::class, 'deleteCollegePOC']);
Route::delete('/delete-lead-pocs/{employee_id}', [UserManagement::class, 'deleteLeadPOC']);
Route::delete('/delete-head-pocs/{employee_id}', [UserManagement::class, 'deleteHeadPOC']);
Route::delete('/delete-esl-admins/{employee_id}', [UserManagement::class, 'deleteEslAdmin']);

// User Management (Profile Management)
Route::get('/get-user', [UserManagement::class, 'fetchUserProfile']);
Route::middleware('auth:sanctum')->post('/upload-profile-picture', [UserManagement::class, 'uploadProfilePicture']);
Route::middleware('auth:sanctum')->put('/update-user', [UserManagement::class, 'updateUser']);

// User Management (Reset Password)
Route::put('/students/{student_id}/reset-password', [UserManagement::class, 'resetPassword']);
Route::put('/college-poc/{employee_id}/reset-password', [UserManagement::class, 'resetPasswordCollegePOC']);
Route::put('/lead-poc/{employee_id}/reset-password', [UserManagement::class, 'resetPasswordLeadPOC']);
Route::put('/head-poc/{employee_id}/reset-password', [UserManagement::class, 'resetPasswordEIEHeadPOC']);
Route::put('/esl-admins/{employee_id}/reset-password', [UserManagement::class, 'resetPasswordEslAdmin']);

//EPGF Setup
Route::post('/import', [EpgfRubricController::class, 'import']);
Route::get('/rubric-versions', [EpgfRubricController::class, 'getRubricVersions']);
Route::post('/set-default', [EpgfRubricController::class, 'setDefault']);
Route::post('/get-rubric-details', [EpgfRubricController::class, 'getRubricDetails']);
Route::get('/rubric/active-version', [EpgfRubricController::class, 'getActiveVersion']);
Route::get('/display-epgf-rubric', [EpgfRubricController::class, 'displayEpgfRubric']);

//Update EPGF Rubric
Route::put('/pronunciation/update/{id}', [EpgfRubricController::class, 'updatePronunciation']);
Route::put('/grammar/update/{id}', [EpgfRubricController::class, 'updateGrammar']);
Route::put('/fluency/update/{id}', [EpgfRubricController::class, 'updateFluency']);

// Fetch Pronunciation
Route::get('/consistency/{majorVersion}', [EpgfRubricController::class, 'getConsistency']);
Route::get('/clarity/{majorVersion}', [EpgfRubricController::class, 'getClarity']);
Route::get('/articulation/{majorVersion}', [EpgfRubricController::class, 'getArticulation']);
Route::get('/intonationStress/{majorVersion}', [EpgfRubricController::class, 'getIntonationStress']);

// Fetch Grammar
Route::get('/accuracy/{majorVersion}', [EpgfRubricController::class, 'getAccuracy']);
Route::get('/clarityOfThought/{majorVersion}', [EpgfRubricController::class, 'getClarityOfThought']);
Route::get('/syntax/{majorVersion}', [EpgfRubricController::class, 'getSyntax']);

// Fetch Fluency
Route::get('/qualityOfResponse/{majorVersion}', [EpgfRubricController::class, 'getQualityOfResponse']);
Route::get('/detailOfResponse/{majorVersion}', [EpgfRubricController::class, 'getDetailOfResponse']);

// EpgfScoreCard routes
Route::get('/epgf-scorecard', [EpgfScoreCardController::class, 'getCourseDetails']);
Route::get('/epgf-scorecard/students', [EpgfScoreCardController::class, 'getActiveStudents']);
Route::get('/active-students', [EpgfScoreCardController::class, 'getActiveStudents']);
Route::post('/eie-scorecard-class-reports', [EpgfScoreCardController::class, 'storeStudentDataReports']);
Route::get('/get-student-count', [EpgfScoreCardController::class, 'getStudentCountByCourseCode']);
Route::get('/get-student-count-active', [EpgfScoreCardController::class, 'getStudentCountByCourseCodeAndActive']);
Route::get('/get-class-average', [EpgfScoreCardController::class, 'getClassAverageByCourseCode']);
Route::get('/get-evaluated-count', [EpgfScoreCardController::class, 'getEvaluatedCount']);
Route::post('/store-class-data', [EpgfScoreCardController::class, 'storeClassData']);
Route::post('/store-class-data-month', [EpgfScoreCardController::class, 'storeClassDataMonth']);
Route::get('/submitted-scorecards', [EpgfScoreCardController::class, 'getSubmittedStudentIds']);
Route::get('/scorecards/{student_id}', [EieScorecardClassReportController::class, 'getByStudentId']);

// ClassList routes
Route::get('/class-list', [ClassListController::class, 'getClassListByDepartment']);
Route::get('/dropped-class-list', [ClassListController::class, 'getDroppedClassListByDepartment']);

Route::post('/upload-class-list', [ClassListController::class, 'uploadClassList']);
Route::get('/manage-class-list', [ClassListController::class, 'ManageClassList']);
Route::put('/update-student/{class_lists_id}', [ClassListController::class, 'updateStudent']);
Route::put('/update-student-college-poc/{class_lists_id}', [ClassListController::class, 'updateStudentCollegePoc']);
Route::get('/class-lists', [ClassListController::class, 'fetchMonthlyChamps']);
Route::get('/get-courses-by-department', [ClassListController::class, 'getCoursesByDepartment']);
Route::get('/get-courses-by-department-poc', [ClassListController::class, 'getCoursesPOC']);
Route::get('/get-courses-by-department-student', [ClassListController::class, 'getCoursesByDepartmentStudent']);
Route::get('/student-statistics', [ClassListController::class, 'getStudentStatistics']);
Route::get('/classlists', [ClassListController::class, 'getStudentsByMonth']);
Route::post('/evaluate/save', [ClassListController::class, 'saveData']);
Route::post('/evaluate/submit', [ClassListController::class, 'submitData']);
Route::post('/store-eie-champions', [ClassListController::class, 'storeSelectedChamp']);
Route::post('/evaluate/check-month', [ClassListController::class, 'checkMonth']);

// ImplementingSubject routes
Route::get('/implementing-subject/{employee_id}', [ImplementingSubjectController::class, 'getClassData']);
Route::get('/implementing-subject-graph/{employee_id}', [ImplementingSubjectController::class, 'getClassDataGraph']);
Route::post('/upload-subjects', [ImplementingSubjectController::class, 'upload'])->name('subjects.upload');
Route::get('/esl-implementing-subjects', [ImplementingSubjectController::class, 'index']);
Route::get('/esl-archived-implementing-subjects', [ImplementingSubjectController::class, 'archived']);
Route::put('/esl-update-implementing-subjects/{courseCode}', [ImplementingSubjectController::class, 'update']);
Route::put('/esl-update-archived-implementing-subjects/{courseCode}', [ImplementingSubjectController::class, 'updateArchive']);
Route::get('/implementing-subjects', [ImplementingSubjectController::class, 'fetchImplementingSubjects']);
Route::put('/update-implementing-subjects/{courseCode}', [ImplementingSubjectController::class, 'updateImplementingSubject'])->name('subjects.updateImplementingSubject');
Route::get('/employee-department/{userType}/{employeeId}',
           [ImplementingSubjectController::class, 'getEmployeeDepartment']
)->where('userType', '.*');
Route::get('/getDepartmentsOptions', [ImplementingSubjectController::class, 'getDepartments']);
Route::get('/getDepartmentsOptionsForPOCs', [ImplementingSubjectController::class, 'getDepartmentForPOCs']);
Route::get('/getSchoolYears', [ImplementingSubjectController::class, 'getSchoolYears']);
Route::get('/getUserDepartment/{employee_id}', [ImplementingSubjectController::class, 'getUserDepartment']);
Route::post('/archive-implementing-subjects', [ImplementingSubjectController::class, 'archiveSubjects']);
Route::post('/restore-implementing-subjects', [ImplementingSubjectController::class, 'restoreSubjects']);
Route::post('/delete-implementing-subjects', [ImplementingSubjectController::class, 'deleteSubjects']);


// Route to get the programs for a department
Route::get('/programs/{department}', [ImplementingSubjectController::class, 'getProgramsForDepartment']);
Route::get('/programs-with-enrollment-first-semester/{department}', [ImplementingSubjectController::class, 'getProgramsWithEnrollmentCountFirstSemester']);
Route::get('/programs-with-enrollment-second-semester/{department}', [ImplementingSubjectController::class, 'getProgramsWithEnrollmentCountSecondSemester']);
Route::get('/implementing-subjects/dropdown', [ImplementingSubjectController::class, 'getDropdownData']);
Route::get('/implementing-subjects/specific-dropdown', [ImplementingSubjectController::class, 'getDropdownSpecificData']);
Route::get('/implementing-subjects/master-specific-dropdown', [ImplementingSubjectController::class, 'getDropdownSpecificDataMaster']);
Route::get('/classlists/departments', [ImplementingSubjectController::class, 'getDepartmentForStudents']);

// CollegePOC routes
Route::get('/pocs', [CollegePOCController::class, 'getPocs'])->name('college.pocs');
Route::get('/filtered-pocs', [CollegePOCController::class, 'getFilteredPocs'])->name('college.filtered_pocs');
Route::get('/college-pocs', [CollegePOCController::class, 'getPocs']);
Route::get('/lead-pocs', [CollegePOCController::class, 'getLeadPOCs']);
Route::get('/eie-head-pocs', [CollegePOCController::class, 'getEIEHeads']);
Route::get('/filtered-pocs-department', [CollegePOCController::class, 'getFilteredDepartmentPOCs']);

// MasterClassList routes
Route::post('/import-master-class-list', [MasterClassListController::class, 'import']);
Route::get('/master-class-list-department/{employee_id}', [MasterClassListController::class, 'index']);
Route::get('/master-class-list-students', [MasterClassListController::class, 'getStudents']);
Route::get('/master-class-list-department', [MasterClassListController::class, 'getDepartments']);
Route::get('/master-class-list-school-year', [MasterClassListController::class, 'getSchoolYears']);
Route::put('/master-class-list/{id}', [MasterClassListController::class, 'updateMasterClassList']);
Route::put('/update-grad-candidate/{id}', [MasterClassListController::class, 'updateCandidate']);
Route::get('/top-epgf', [MasterClassListController::class, 'getTopEPGF']);


// Authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::middleware('auth:sanctum')->get('/user-info', [AuthController::class, 'getUserInfo']);
Route::middleware('auth:sanctum')->delete('/logout', [AuthController::class, 'logout']);
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF token set']);
});

