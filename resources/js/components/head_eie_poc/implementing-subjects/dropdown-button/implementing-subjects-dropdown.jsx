import React, { useState, useEffect } from "react";
import apiService from "@services/apiServices";
import "./implementing-subjects-dropdown.css";
import { FaChevronDown } from "react-icons/fa";

const ImplementingSubjectDropdown = ({
  selectedProgram,
  setSelectedProgram,
  selectedYearLevel,
  setSelectedYearLevel,
  selectedSemester,
  setSelectedSemester,
  setSearchQuery,
}) => {
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isYearLevelOpen, setIsYearLevelOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    if (!selectedSemester) {
      const currentMonth = new Date().getMonth() + 1; // getMonth is 0-indexed
      const defaultSemester = (currentMonth >= 8 && currentMonth <= 12) ? "1st Semester" : "2nd Semester";
      setSelectedSemester(defaultSemester);
    }
  }, [selectedSemester, setSelectedSemester]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = localStorage.getItem('employee_id');
        const response = await apiService.get(`/implementing-subjects/specific-dropdown`, {
          params: { employee_id: employeeId }
        });

        if (response.status === 200) {
          const data = response.data;
          setPrograms(data.programs || []);
          setYearLevels(data.year_levels || []);
          setSemesters(data.semesters || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to reset filters and view all data
  const handleResetFilters = () => {
    setSelectedProgram("");
    setSelectedYearLevel("");
    setSelectedSemester("");
    setSearchQuery("");
  };

  return (
    <div
    className="eie-head-dropdown-container"
    style={{
      display: "flex",
      gap: "20px",
      alignItems: "center",
    }}
    >
    {/* Program Dropdown */}
    <div className="eie-head-dropdown-wrapper">
    <button
    className="eie-head-dropdown-btn"
    onClick={() => setIsProgramOpen((prev) => !prev)}
    >
    {selectedProgram || "Select Program"}
    <FaChevronDown className={`eie-head-dropdown-arrow ${isProgramOpen ? "open" : ""}`} />
    </button>
    {isProgramOpen && (
      <div className="eie-head-dropdown-menu">
      {programs.map((program, index) => (
        <p
        key={index}
        className={`eie-head-dropdown-item ${selectedProgram === program ? "eie-head-selected" : ""}`}
        onClick={() => {
          setSelectedProgram(program);
          setIsProgramOpen(false);
        }}
        >
        {program}
        </p>
      ))}
      </div>
    )}
    </div>

    {/* Year Level Dropdown */}
    <div className="eie-head-dropdown-wrapper">
    <button
    className="eie-head-dropdown-btn"
    onClick={() => setIsYearLevelOpen((prev) => !prev)}
    >
    {selectedYearLevel || "Select Year Level"}
    <FaChevronDown className={`eie-head-dropdown-arrow ${isYearLevelOpen ? "open" : ""}`} />
    </button>
    {isYearLevelOpen && (
      <div className="eie-head-dropdown-menu">
      {yearLevels.map((level, index) => (
        <p
        key={index}
        className={`eie-head-dropdown-item ${selectedYearLevel === level ? "eie-head-selected" : ""}`}
        onClick={() => {
          setSelectedYearLevel(level);
          setIsYearLevelOpen(false);
        }}
        >
        {level}
        </p>
      ))}
      </div>
    )}
    </div>

    {/* Semester Dropdown */}
    <div className="eie-head-dropdown-wrapper">
    <button
    className="eie-head-dropdown-btn"
    onClick={() => setIsSemesterOpen((prev) => !prev)}
    >
    {selectedSemester || "Select Semester"}
    <FaChevronDown className={`eie-head-dropdown-arrow ${isSemesterOpen ? "open" : ""}`} />
    </button>
    {isSemesterOpen && (
      <div className="eie-head-dropdown-menu">
      {semesters.map((semester, index) => (
        <p
        key={index}
        className={`eie-head-dropdown-item ${selectedSemester === semester ? "eie-head-selected" : ""}`}
        onClick={() => {
          setSelectedSemester(semester);
          setIsSemesterOpen(false);
        }}
        >
        {semester}
        </p>
      ))}
      </div>
    )}
    </div>

    {/* Reset Filter Link */}
    <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleResetFilters();
    }}
    style={{
      textDecoration: "underline",
      color: "black",
      cursor: "pointer",
      fontSize: "16px",
      whiteSpace: "nowrap",
    }}
    >
    Reset Filter
    </a>
    </div>
  );
};

export default ImplementingSubjectDropdown;
