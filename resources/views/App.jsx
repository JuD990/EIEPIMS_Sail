import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import LoginForm from "../js/components/Login/LoginForm";

// ESL Champ
import EslChampionDashboard from "../js/components/esl_champion/EslChampionDashboard/EslChampionDashboard";

// Student
import StudentDashboard from "../js/components/student/StudentDashboard";
import StudentViewScores from "../js/components/student/eie-evaluations-scores/view-scores";

// Head POC
import HeadEiePocDashboard from "../js/components/head_eie_poc/eie-head-dashboard/HeadEiePocDashboard";
import EIEHeadReporting from "../js/components/head_eie_poc/eie-head-eie-reporting/eie-head-eie-reporting";
import MasterClassList from "../js/components/head_eie_poc/master-class-list/master-class-list";
import ImplementingSubjects from "../js/components/head_eie_poc/implementing-subjects/implementing-subjects";
import EIEHeadStudentManagement from "../js/components/head_eie_poc/eie-head-student-management/eie-head-student-management";
import EIEHeadGraduatingList from "../js/components/head_eie_poc/graduating-list/graduating-list";
import EIEHeadAssignPOC from "../js/components/head_eie_poc/assign_poc/assign_poc";
import EIEHeadDiagnosticReport from "../js/components/head_eie_poc/eie-diagnostic-reports/eie-diagnostic-reports";
import EIEHeadChampSelection from "../js/components/head_eie_poc/champion_list/eie-champs";

// Lead POC
import LeadEiePocDashboard from "../js/components/lead_eie_poc/lead-poc-dashboard/LeadEiePocDashboard";
import LeadPocReporting from "../js/components/lead_eie_poc/lead-poc-eie-reporting/lead-poc-eie-reporting";

// College POC
import CollegePocDashboard from "../js/components/college_poc/CollegePocDashboard/CollegePocDashboard";
import CollegePocImplementingSubject from "../js/components/college_poc/CollegePocClassManagement/CollegePocClassManagement";
import EPGFScorecard from "../js/components/college_poc/EPGFScorecard/EPGFScorecard";
import CollegePocEieReporting from "../js/components/college_poc/EIEreporting/EIEreporting";
import CollegePocStudentManagement from "../js/components/college_poc/StudentManagement/StudentManagement";

// ESL Prime
import EslPrimeEieReporting from "../js/components/esl_prime/EIE-reporting/esl-prime-eie-reporting";
import ElPrimeEPGFRubricVersion from "../js/components/esl_prime/EIE-management/epgf-rubric-version/esl-prime-epgf-rubric-versioning";
import EslCertification from "../js/components/esl_prime/EIE-management/certification/esl-prime-certification";
import EslTemplate from "../js/components/esl_prime/EIE-management/template/esl-template-champion";
import EslPrimeDashboard from "../js/components/esl_prime/EslPrimeDashboard/EslPrimeDashboard";
import EslInterviewScorecard from "../js/components/esl_prime/EIE-diagnostic/esl-interview-scorecard/esl-interview-scorecard";
import EslDiagnosticReports from "../js/components/esl_prime/EIE-diagnostic/eie-diagnostic-reports/eie-diagnostic-reports";
import EslImplementingSubjects from "../js/components/esl_prime/EIE-management/implementing-subjects/implementing-subjects";
import EslPrimeAccountManagement from "../js/components/esl_prime/EIE-management/accounts/esl-prime-account-management";
import EslAssignPOC from "../js/components/esl_prime/EIE-management/assign_poc/assign_poc";

// Unauthorized Page
const Unauthorized = () => <h1>403 - Unauthorized Access</h1>;

const eslPrimeAccessRoles = ['esl_prime', 'esl_champion'];

// PrivateRoute
import PrivateRoute from "../js/components/routes/PrivateRoute";

const App = () => {
  return (
    <Router>
    <Routes>
    <Route path="/" element={<LoginForm />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Student */}
    <Route path="/student-dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
    <Route path="/view-scores/:historicalScorecardId" element={<PrivateRoute roles={['student']}><StudentViewScores /></PrivateRoute>} />

    {/* College POC */}
    <Route path="/college-poc-dashboard" element={<PrivateRoute roles={['college_poc']}><CollegePocDashboard /></PrivateRoute>} />
    <Route path="/class-management" element={<PrivateRoute roles={['college_poc']}><CollegePocImplementingSubject /></PrivateRoute>} />
    <Route path="/epgf-scorecard" element={<PrivateRoute roles={['college_poc']}><EPGFScorecard /></PrivateRoute>} />
    <Route path="/college-poc-eie-reporting" element={<PrivateRoute roles={['college_poc']}><CollegePocEieReporting /></PrivateRoute>} />
    <Route path="/college-poc-student-management" element={<PrivateRoute roles={['college_poc']}><CollegePocStudentManagement /></PrivateRoute>} />

    {/* ESL Champion */}
    <Route path="/esl-dashboard" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslChampionDashboard /></PrivateRoute>} />

    {/* ESL Prime */}
    <Route path="/esl-dashboard" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslPrimeDashboard /></PrivateRoute>} />
    <Route path="/esl-eie-reporting" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslPrimeEieReporting /></PrivateRoute>} />
    <Route path="/esl-diagnostic-reports" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslDiagnosticReports /></PrivateRoute>} />
    <Route path="/esl-interview-scorecard" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslInterviewScorecard /></PrivateRoute>} />
    <Route path="/esl-epgf-versioning" element={<PrivateRoute roles={eslPrimeAccessRoles}><ElPrimeEPGFRubricVersion /></PrivateRoute>} />
    <Route path="/esl-certification" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslCertification /></PrivateRoute>} />
    <Route path="/esl-template" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslTemplate /></PrivateRoute>} />
    <Route path="/esl-account-management" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslPrimeAccountManagement /></PrivateRoute>} />
    <Route path="/esl-implementing-subjects" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslImplementingSubjects /></PrivateRoute>} />
    <Route path="/esl-assign-poc" element={<PrivateRoute roles={eslPrimeAccessRoles}><EslAssignPOC /></PrivateRoute>} />


    {/* EIE Head POC */}
    <Route path="/eie-head-poc-dashboard" element={<PrivateRoute roles={['eie_head_poc']}><HeadEiePocDashboard /></PrivateRoute>} />
    <Route path="/eie-head-reporting" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadReporting /></PrivateRoute>} />
    <Route path="/eie-head-student-management" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadStudentManagement /></PrivateRoute>} />
    <Route path="/eie-head-master-class-list" element={<PrivateRoute roles={['eie_head_poc']}><MasterClassList /></PrivateRoute>} />
    <Route path="/implementing-subjects" element={<PrivateRoute roles={['eie_head_poc']}><ImplementingSubjects /></PrivateRoute>} />
    <Route path="/eie-head-graduating-list" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadGraduatingList /></PrivateRoute>} />
    <Route path="/eie-head-assign-poc" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadAssignPOC /></PrivateRoute>} />
    <Route path="/eie-head-diagnostic-report" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadDiagnosticReport /></PrivateRoute>} />
    <Route path="/eie-head-champion-selection" element={<PrivateRoute roles={['eie_head_poc']}><EIEHeadChampSelection /></PrivateRoute>} />

    {/* Lead POC */}
    <Route path="/lead-eie-poc-dashboard" element={<PrivateRoute roles={['lead_eie_poc']}><LeadEiePocDashboard /></PrivateRoute>} />
    <Route path="/lead-poc-reporting" element={<PrivateRoute roles={['lead_eie_poc']}><LeadPocReporting /></PrivateRoute>} />
    </Routes>
    </Router>
  );
};

export default App;
