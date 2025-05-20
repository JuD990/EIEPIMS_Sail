import React, { useState, useEffect } from "react";
import ESLSidebar from '../sidebar/esl-sidebar';
import UserInfo from '@user-info/User-info';
import TableComponent from "./table/esl-table-dashboard";
import DashboardDropdown from "./dropdown-button/dropdown-esl-dashboard";
import CollegeProficiencyChart from "./college-proficiency-distribution/college-proficiency-distribution";
import DepartmentEieSparkPerformance from "./department-eie-spark-performance/department-eie-spark-performance";
import DepartmentPerformance from "./imp-subject-performance/imp-subjects-performance";

const EslPrimeDashboard = () => {
  const currentMonth = new Date().getMonth(); // 0 to 11
  const currentYear = new Date().getFullYear();

  // Defaults based on your dropdown's logic
  const defaultSemester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";
  const defaultSchoolYear = `${currentYear}-${currentYear + 1}`;

  // You might want to initialize department to something valid if you have a list to avoid empty string issues
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
  const [fullDepartment, setFullDepartment] = useState("");

  useEffect(() => {
    // Optionally reset or fetch data on change of filters
  }, [selectedDepartment, selectedSchoolYear, selectedSemester]);

  return (
    <div>
    <ESLSidebar />
    <UserInfo />
    <br /><br /><br />
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '340px', color: '#383838' }}>
    Dashboard
    </h1>
    {/* Pass filters if these components rely on them */}
    <CollegeProficiencyChart
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    />
    <br />
    <DepartmentPerformance
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    fullDepartment={fullDepartment}
    />
    <br />
    <DepartmentEieSparkPerformance
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    fullDepartment={fullDepartment}
    />
    <br />
    <div className="dashboard-table-container">
    <div style={{ marginBottom: "10px" }}>
    <h2 style={{ textAlign: "left", fontFamily: "Poppins", fontWeight: "700" }}>
    Summary overall performance by month
    </h2>
    <p
    style={{
      fontFamily: 'Poppins',
      textAlign: 'left',
      marginTop: '-5px',
      marginBottom: '-3px',
      fontSize: '0.95rem',
      fontStyle: 'italic',
      color: '#666666',
    }}
    >
    {selectedSemester}, {selectedSchoolYear.replace('/', '-')}
    </p>
    <DashboardDropdown
    setSelectedDepartment={setSelectedDepartment}
    selectedSchoolYear={selectedSchoolYear}
    setSelectedSchoolYear={setSelectedSchoolYear}
    selectedSemester={selectedSemester}
    setSelectedSemester={setSelectedSemester}
    />
    <TableComponent
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    />
    </div>
    </div>
    </div>
  );
};

export default EslPrimeDashboard;
