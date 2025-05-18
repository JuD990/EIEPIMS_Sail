import React, { useState } from "react";
import CollegePOCsidebar from "../sidebar/college-poc-sidebar";
import UserInfo from "@user-info/User-info";
import ImplementingSubjects from "./implementing-subjects/implementing-subject";
import DashboardDropdown from "./dropdown-button/dashboard-dropdown";

const getCurrentSemester = () => {
  const month = new Date().getMonth() + 1; // 1 to 12
  if (month >= 8 && month <= 12) return "1st Semester";
  if (month >= 1 && month <= 5) return "2nd Semester";
  // June & July fallback
  return "1st Semester";
};

const CollegePocImplementingSubjects = () => {
  const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester());

  return (
    <div style={{ overflowX: "hidden", overflowY: "auto",}}>
    <CollegePOCsidebar />
    <UserInfo />
    <br /><br /><br /><br /><br />
    <div className="implementing-subject-page-title">
    <h1 style={{ fontFamily: "Epilogue", fontWeight: 800, marginLeft: "350px", color: "#383838" }}>
    Class Record
    </h1>
    </div>
    <DashboardDropdown selectedSemester={selectedSemester} setSelectedSemester={setSelectedSemester} />
    <ImplementingSubjects semester={selectedSemester} />
    </div>
  );
};

export default CollegePocImplementingSubjects;
