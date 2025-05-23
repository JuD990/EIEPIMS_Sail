import React, { useState } from "react";
import EIEHeadSidebar from '../sidebar/eie-head-sidebar';
import UserInfo from '@user-info/User-info';
import StudentManagementDropdown from './dropdown-button/student-management-dropdown';
import StudentManagementTable from './student-management-table/student-management-table';
import StudentRemovedTable from './removed-from-list/remove-from-list-table';

const MasterClassList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState(null); // <-- added selectedYearLevel state

  // Handle title and code selection change
  const handleTitleChange = (title) => {
    setSelectedTitle(title);
  };

  const handleCodeChange = (code) => {
    setSelectedCode(code);
  };

  const getCurrentSemester = () => {
    const month = new Date().getMonth() + 1; // getMonth is 0-based
    if (month >= 8 && month <= 12) {
      return '1st Semester';
    } else if (month >= 1 && month <= 5) {
      return '2nd Semester';
    } else {
      return 'Semester Break'; // June & July
    }
  };

  const currentSemester = getCurrentSemester();

  return (
    <div style={{ overflow: "hidden" }}>
    <EIEHeadSidebar />
    <UserInfo />
    <br /><br /><br /><br />
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '350px', color: '#383838' }}>
    Master Class List - {currentSemester}
    </h1>

    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '20px 35px',
      width: '100%',
    }}>
    <StudentManagementDropdown
    selectedTitle={selectedTitle}
    onTitleChange={handleTitleChange}
    selectedCode={selectedCode}
    onCodeChange={handleCodeChange}
    onYearLevelChange={setSelectedYearLevel} // <-- passing the state handler
    />
    <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search"
    style={{
      width: '476px',
      height: '60px',
      borderRadius: '8px',
      borderColor: '#333333',
      fontSize: '16px',
      marginRight: '70px'
    }}
    />
    </div>

    <StudentManagementTable
    searchQuery={searchQuery}
    selectedTitle={selectedTitle}
    selectedCode={selectedCode}
    selectedYearLevel={selectedYearLevel}  // <-- passing selectedYearLevel
    />
    <br /><br /><br />
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '350px', color: '#383838' }}>
    Removed from the List
    </h1>
    <StudentRemovedTable/>
    <br />
    </div>
  );
};

export default MasterClassList;
