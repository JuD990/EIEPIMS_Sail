import React, { useState } from "react";
import EIEHeadSidebar from '../sidebar/eie-head-sidebar';
import UserInfo from '@user-info/User-info';
import ImplementingSubjectsTable from "./implementing-subjects-table/implementing-subjects-table";
import Dropdown from "./dropdown-button/implementing-subjects-dropdown";

const EIEHeadImplementingSubjects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const handleFileUpload = (file) => {
    console.log("Uploaded file:", file);
  };

  return (
    <div style={{ overflow: "hidden" }}>
    <EIEHeadSidebar />
    <UserInfo />
    <br /><br /><br /><br />
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '350px', color: '#383838' }}>Implementing Subjects</h1>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      margin: '20px 35px',
      gap: '10px',
      width: '100%',
    }}>

    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '430px'
    }}>
    {/* Dropdown */}
    <Dropdown
    selectedProgram={selectedProgram}
    setSelectedProgram={setSelectedProgram}
    selectedYearLevel={selectedYearLevel}
    setSelectedYearLevel={setSelectedYearLevel}
    selectedSemester={selectedSemester}
    setSelectedSemester={setSelectedSemester}
    setSearchQuery={setSearchQuery}
    />

    {/* Search Input */}
    <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search"
    style={{
      width: '375px',
      height: '60px',
      borderRadius: '8px',
      borderColor: '#333333',
      paddingLeft: '10px',
      fontSize: '16px',
      marginRight: '55px'
    }}
    />
    </div>
    </div>

    <ImplementingSubjectsTable
    searchQuery={searchQuery}
    selectedProgram={selectedProgram}
    selectedYearLevel={selectedYearLevel}
    selectedSemester={selectedSemester}
    />
    <br />
    </div>
  );
};

export default EIEHeadImplementingSubjects;
