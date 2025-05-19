import React, { useState, useEffect } from "react";
import axios from "axios";
import UserInfo from "@user-info/User-info";
import TableComponent from "./table/lead-poc-dashboard";
import LeadSidebar from "../sidebar/lead-poc-sidebar";
import DashboardDropdown from "./dropdown-button/dropdown-lead-poc-dashboard";
import ImpSubjectsPerformance from "./imp-subject-performance/imp-subjects-performance";
import EieSparkPerformance from "./eie-spark-performance/eie-spark-performance.jsx";

const LeadEiePocDashboard = () => {
  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
  const defaultSemester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";
  const defaultSchoolYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester);

  const [userDepartment, setUserDepartment] = useState("");
  const [userFullDepartment, setUserFullDepartment] = useState("");

  useEffect(() => {
    const fetchUserDepartment = async () => {
      const employeeId = localStorage.getItem("employee_id");
      const userType = localStorage.getItem("userType");

      if (employeeId && userType) {
        try {
          const res = await axios.get(`http://localhost:8000/api/employee-department/${userType}/${employeeId}`);
          const dept = res.data?.department;
          const fullDept = res.data?.full_department;

          if (res.data.success) {
            setUserDepartment(dept);
            setUserFullDepartment(fullDept);
          }
        } catch (err) {
          console.error("Error fetching user department:", err);
        }
      }
    };

    fetchUserDepartment();
  }, []);

  return (
    <div>
    <LeadSidebar />
    <UserInfo />
    <br /><br /><br />

    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '350px', color: '#383838' }}>
    Dashboard
    </h1>

    <ImpSubjectsPerformance
    userFullDepartment={userFullDepartment}
    userDepartment={userDepartment}
    />
    <br />

    <EieSparkPerformance userDepartment={userDepartment} />
    <br />

    <div className="dashboard-table-container">
    <div style={{ marginBottom: "10px" }}>
    <h2 style={{ textAlign: "left", fontFamily: "Poppins", fontWeight: "700" }}>
    Summary overall performance by month
    </h2>
    <h4>{selectedSemester}, {selectedDepartment} {selectedSchoolYear.replace('/', '-')}</h4>
    <DashboardDropdown
    setSelectedDepartment={setSelectedDepartment}
    setSelectedSchoolYear={setSelectedSchoolYear}
    setSelectedSemester={setSelectedSemester}
    userDepartment={userDepartment}
    />

    <TableComponent
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    />
    </div>
    </div>

    <br />
    </div>
  );
};

export default LeadEiePocDashboard;
