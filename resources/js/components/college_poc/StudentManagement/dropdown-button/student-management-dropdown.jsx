import React, { useState, useEffect } from "react";
import axios from "axios";
import "./student-management-dropdown.css";
import { FaChevronDown } from "react-icons/fa";

const StudentManagementDropdown = ({ selectedTitle, selectedCode, selectedProgram, onTitleChange, onCodeChange, onProgramChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);  // New state for program dropdown
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]); // For storing program data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get("/api/classlists/departments");

        if (response.data && response.data.programs) {
          setPrograms(response.data.programs);
        }
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Failed to load programs. Please try again.");
      }
    };

    const fetchCourses = async () => {
      try {
        const employeeId = localStorage.getItem("employee_id");
        const response = await axios.get("/api/get-courses-by-department-poc", {
          headers: { 'X-Employee-ID': employeeId, },
        });

        if (response.data && typeof response.data === "object") {
          const flattenedCourses = [];
          Object.entries(response.data).forEach(([title, codes]) => {
            if (Array.isArray(codes)) {
              codes.forEach((code) => {
                flattenedCourses.push({ title, code });
              });
            }
          });

          if (flattenedCourses.length === 0) {
            setError("No courses available for your department.");
          } else {
            setCourses(flattenedCourses.slice(0, 10)); // Optional: limit to 10
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
    fetchCourses();
  }, []);

  const handleReset = () => {
    onTitleChange(null);
    onCodeChange(null);
    onProgramChange(null);  // Reset program as well
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleProgramDropdown = () => {
    setIsProgramDropdownOpen((prev) => !prev);
  };

  const getSelectedText = () => {
    const selected = courses.find(course => course.code === selectedCode);
    return selected ? `${selected.title} - ${selected.code}` : "Select Course";
  };

  return (
    <div className="eie-head-student-dropdown-container">
    {isLoading ? (
      <p>Loading...</p>
    ) : (
      <>
      {/* Program Dropdown */}
      <div className="student-dropdown-wrapper">
      <button className="student-dropdown-btn" onClick={toggleProgramDropdown}>
      {selectedProgram || "Select Program"}
      <FaChevronDown
      className={`dropdown-arrow ${isProgramDropdownOpen ? "open" : ""}`}
      />
      </button>
      {isProgramDropdownOpen && (
        <div className="student-dropdown-menu">
        {programs.length === 0 ? (
          <p className="student-dropdown-item">No programs available</p>
        ) : (
          programs.map((program, index) => (
            <p
            key={index}
            className={`student-dropdown-item ${selectedProgram === program ? "selected" : ""}`}
            onClick={() => {
              onProgramChange(program);
              setIsProgramDropdownOpen(false);
            }}
            >
            {program}
            </p>
          ))
        )}
        </div>
      )}
      </div>

      {/* Course Dropdown */}
      <div className="student-dropdown-wrapper">
      <button className="student-dropdown-btn" onClick={toggleDropdown}>
      {getSelectedText()}
      <FaChevronDown
      className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
      />
      </button>
      {isDropdownOpen && (
        <div className="student-dropdown-menu">
        {courses.length === 0 ? (
          <p className="student-dropdown-item">No courses available</p>
        ) : (
          courses.map((course, index) => (
            <p
            key={index}
            className={`student-dropdown-item ${selectedCode === course.code ? "selected" : ""}`}
            onClick={() => {
              onTitleChange(course.title);
              onCodeChange(course.code);
              setIsDropdownOpen(false);
            }}
            >
            {course.title} - {course.code}
            </p>
          ))
        )}
        </div>
      )}
      </div>

      {/* Reset Filter */}
      <div className="reset-filter" onClick={handleReset}>
      Reset Selection
      </div>
      </>
    )}
    </div>
  );
};

export default StudentManagementDropdown;
