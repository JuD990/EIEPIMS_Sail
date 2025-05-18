import React, { useState } from "react";
import "./dashboard-dropdown.css";
import { FaChevronDown } from "react-icons/fa";

const DashboardDropdown = ({ selectedSemester, setSelectedSemester }) => {
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const semesters = ["1st Semester", "2nd Semester"];

  return (
    <div className="dropdown-yearlevel-semester">
    <div className="dropdown-semester">
    <button
    className="dropbtn"
    onClick={() => setIsSemesterOpen(!isSemesterOpen)}
    >
    <span className="dropdown-label">{selectedSemester}</span>
    <FaChevronDown
    className={`dropdown-icon ${isSemesterOpen ? "open" : ""}`}
    />
    </button>
    {isSemesterOpen && (
      <div className="dropdown-content-semester">
      {semesters.map((semester, index) => (
        <p
        key={index}
        className={`dropdown-option ${
          selectedSemester === semester ? "selected" : ""
        }`}
        onClick={() => {
          setSelectedSemester(semester);  // update parent state here
          setIsSemesterOpen(false);
        }}
        >
        {semester}
        </p>
      ))}
      </div>
    )}
    </div>
    </div>
  );
};


export default DashboardDropdown;
