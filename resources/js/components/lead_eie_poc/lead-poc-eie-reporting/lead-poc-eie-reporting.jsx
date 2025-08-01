import React, { useState } from "react";
import LeadSidebar from "../sidebar/lead-poc-sidebar";
import UserInfo from '@user-info/User-info';
import Reporting from "./table/eie-reporting-table";
import ReportingDropdown from "./dropdown-button/dropdown-lead-poc-reporting";

const EIEreporting = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to handle dropdown visibility
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Department state
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(""); // School Year state
  const [selectedSemester, setSelectedSemester] = useState(""); // Semester state

  const currentMonth = new Date().getMonth(); // 0 for January, 11 for December

  // Check if current month is between August (7) and December (11) or January (0) and May (4)

  return (
    <div>
    <LeadSidebar />
    <UserInfo />
    <br /><br /><br /><br /><br />
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '340px', color: '#383838' }}>
    EIE Report - {selectedSemester}, {selectedDepartment} {selectedSchoolYear.replace('/', '-')}
    </h1>
    <ReportingDropdown
    setSelectedDepartment={setSelectedDepartment}
    setSelectedSchoolYear={setSelectedSchoolYear}
    setSelectedSemester={setSelectedSemester}
    />
    <Reporting
    department={selectedDepartment}
    schoolYear={selectedSchoolYear}
    semester={selectedSemester}
    />

    </div>
  );
};

export default EIEreporting;
