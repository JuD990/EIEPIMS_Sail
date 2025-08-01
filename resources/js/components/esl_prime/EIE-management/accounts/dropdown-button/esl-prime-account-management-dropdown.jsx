import React, { useState, useEffect } from "react";
import apiService from "@services/apiServices";
import "./esl-prime-account-management-dropdown.css";
import { FaChevronDown } from "react-icons/fa";

const UserManagementDropdown = ({
  selectedUserType,
  setSelectedUserType,
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  selectedProgram,
  setSelectedProgram,
  selectedYearLevel,
  setSelectedYearLevel,
}) => {
  const [isUserTypeOpen, setIsUserTypeOpen] = useState(false);
  const [localSelectedUserType, setLocalSelectedUserType] = useState("Student");
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isYearLevelOpen, setIsYearLevelOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);

  const userType = ["Student", "College POC", "Lead POC", "EIE Head POC", "ESL Admins"];

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [mainData, departmentData] = await Promise.all([
          apiService.get("/implementing-subjects/dropdown"),
          apiService.get("/getDepartmentsOptionsForPOCs"),
        ]);

        if (mainData.status === 200) {
          setPrograms(mainData.data.programs || []);
          setYearLevels(mainData.data.year_levels || []);
        }

        setDepartments(departmentData.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    const storedUserType = localStorage.getItem("selectedUserType") || "Student";
    setLocalSelectedUserType(storedUserType);
    setSelectedUserType(storedUserType);
  }, [setSelectedUserType]);

  const handleUserTypeChange = (type) => {
    setLocalSelectedUserType(type);
    setSelectedUserType(type);
    localStorage.setItem("selectedUserType", type);
    setIsUserTypeOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedProgram("");
    setSelectedYearLevel("");
    setSelectedDepartment("");
  };

  return (
    <div className="student-dropdown-container">
    <div className="dropdowns-wrapper">
    {/* User Type Dropdown */}
    <div className="student-dropdown-wrapper">
    <button className="student-dropdown-btn" onClick={() => setIsUserTypeOpen((prev) => !prev)}>
    {localSelectedUserType}
    <FaChevronDown className={`dropdown-arrow ${isUserTypeOpen ? "open" : ""}`} />
    </button>
    {isUserTypeOpen && (
      <div className="student-dropdown-menu">
      {userType.map((type, index) => (
        <p
        key={index}
        className={`student-dropdown-item ${localSelectedUserType === type ? "selected" : ""}`}
        onClick={() => handleUserTypeChange(type)}
        >
        {type}
        </p>
      ))}
      </div>
    )}
    </div>

    {/* Conditionally render Program and Year Level for Student only */}
    {selectedUserType === "Student" && (
      <>
      {/* Program Dropdown */}
      <div className="esl-monthly-champ-dropdown-wrapper">
      <button className="esl-monthly-champ-dropdown-btn" onClick={() => setIsProgramOpen(prev => !prev)}>
      {selectedProgram || "Select Program"}
      <FaChevronDown className={`esl-monthly-champ-dropdown-arrow ${isProgramOpen ? "open" : ""}`} />
      </button>
      {isProgramOpen && (
        <div className="esl-monthly-champ-dropdown-menu">
        {programs.map((program, index) => (
          <p
          key={index}
          className={`esl-monthly-champ-dropdown-item ${selectedProgram === program ? "esl-monthly-champ-selected" : ""}`}
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
      <div className="esl-monthly-champ-dropdown-wrapper">
      <button className="esl-monthly-champ-dropdown-btn" onClick={() => setIsYearLevelOpen(prev => !prev)}>
      {selectedYearLevel || "Select Year Level"}
      <FaChevronDown className={`esl-monthly-champ-dropdown-arrow ${isYearLevelOpen ? "open" : ""}`} />
      </button>
      {isYearLevelOpen && (
        <div className="esl-monthly-champ-dropdown-menu">
        {yearLevels.map((level, index) => (
          <p
          key={index}
          className={`esl-monthly-champ-dropdown-item ${selectedYearLevel === level ? "esl-monthly-champ-selected" : ""}`}
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
      </>
    )}

    {/* Department Dropdown: show if not ESL Admins */}
    {selectedUserType !== "ESL Admins" && (
      <div className="student-dropdown-wrapper" style={{ position: "relative" }}>
      <button className="student-dropdown-btn" onClick={() => setIsDepartmentOpen((prev) => !prev)}>
      {selectedDepartment || "Select Department"}
      <FaChevronDown className={`dropdown-arrow ${isDepartmentOpen ? "open" : ""}`} />
      </button>
      {isDepartmentOpen && (
        <div className="student-dropdown-menu">
        {departments.map((dept, index) => (
          <p
          key={index}
          className={`student-dropdown-item ${selectedDepartment === dept ? "selected" : ""}`}
          onClick={() => {
            setSelectedDepartment(dept);
            setIsDepartmentOpen(false);
          }}
          >
          {dept}
          </p>
        ))}
        </div>
      )}
      </div>
    )}

    {/* Reset Filter Button */}
    {selectedUserType !== "ESL Admins" && (
      <p
      style={{
        cursor: "pointer",
        fontWeight: 500,
        color: "black",
        marginTop: "12px",
        textDecoration: "underline",
        whiteSpace: "nowrap",
      }}
      onClick={handleResetFilters}
      >
      Reset Filter
      </p>
    )}
    </div>

    <input
    type="text"
    className="global-search-bar"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search"
    />
    </div>
  );
};

export default UserManagementDropdown;
