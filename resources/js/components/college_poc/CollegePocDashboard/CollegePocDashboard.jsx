import React, { useState, useEffect } from "react";
import CollegePOCsidebar from "../sidebar/college-poc-sidebar";
import UserInfo from "@user-info/User-info";
import TableComponent from "./table/college-poc-dashboard";
import DashboardDropdown from "./dropdown-button/dropdown-college-poc-dashboard";
import ImpSubjectsPerformance from "./imp-subject-performance/imp-subjects-performance";
import './college-poc-dashboard.css'; // Assuming you add the styles in a separate CSS file

const CollegePocDashboard = () => {
  const currentMonth = new Date().getMonth(); // 0 for January, 11 for December

  // Default values based on logic in DashboardDropdown
  const defaultSemester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";
  const defaultSchoolYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

  // Optional: useEffect for handling side-effects like data fetching, etc.
  useEffect(() => {
    // If you need any side effects based on selected values, you can handle it here.
  }, [selectedDepartment, selectedSchoolYear, selectedSemester]);

  return (
    <div className="college-poc-dashboard-container">
      <CollegePOCsidebar />
      <UserInfo />
      <br /><br /><br /><br /><br />

      {/* Dashboard Header Section */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <DashboardDropdown
          setSelectedDepartment={setSelectedDepartment}
          setSelectedSchoolYear={setSelectedSchoolYear}
          setSelectedSemester={setSelectedSemester}
        />
      </div>

      {/* Important Subjects Performance */}
      <ImpSubjectsPerformance
          department={selectedDepartment}
          schoolYear={selectedSchoolYear}
          semester={selectedSemester}
      />
      
      <br />

      {/* Tabular Data Display */}
      <div className="dashboard-table-container">
        <h2 className="table-title">
          Summary overall performance by month
        </h2>
        <p
        style={{
          fontFamily: 'Poppins',
          textAlign: 'left',
          marginTop: '-10px',
          fontSize: '0.95rem',
          fontStyle: 'italic',
          color: '#666666',
        }}
        >
        {selectedSemester}, {selectedSchoolYear.replace('/', '-')}
        </p>
        <TableComponent
          department={selectedDepartment}
          schoolYear={selectedSchoolYear}
          semester={selectedSemester}
        />
      </div>
    </div>
  );
};

export default CollegePocDashboard;
