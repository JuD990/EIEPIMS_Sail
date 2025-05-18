import React from "react";
import UserInfo from "@user-info/User-info";
import Studentsidebar from "./sidebar/student-sidebar";
import "./student-dashboard.css";
import CardOne from "./eie-monthly-performance-summary/monthly-performance-summary";
import CardTwo from "./current-implementing-subject/current-student-subject";
import CardThree from "./eie-performance-summary/eie-performance-summary";
import CardFour from "./eie-evaluations-scores/evaluation-scores";
import CardFive from "./diagnostics-report/diagnostics-report";

const StudentDashboard = () => {
  return (
    <div>
    <Studentsidebar />
    <UserInfo />
    <br/><br/><br/><br/>

    <h1 className="dashboard-title">Dashboard</h1>

    {/* Student Dashboard Cards Container */}
    <div className="student-dashboard-cards-container">
    <CardOne />
    <CardTwo />
    <CardThree />
    <CardFour />
    <CardFive />
    </div>
    </div>
  );
};

export default StudentDashboard;
