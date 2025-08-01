import React, { useState, useEffect } from "react";
import apiService from "@services/apiServices";
import "./student-management-dropdown.css";
import { FaChevronDown } from "react-icons/fa";

const StudentManagementDropdown = ({
  selectedTitle,
  selectedCode,
  onTitleChange,
  onCodeChange,
  selectedYearLevel,
  onYearLevelChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const employeeId = localStorage.getItem("employee_id");

        const [courseRes, yearLevelRes] = await Promise.all([
          apiService.get("/get-courses-by-department", {
            headers: { 'X-Employee-ID': employeeId },
          }),
          apiService.get("/classlists/departments")
        ]);

        // Process Courses
        const flattenedCourses = [];
        if (courseRes.data && typeof courseRes.data === "object") {
          Object.entries(courseRes.data).forEach(([title, codes]) => {
            if (Array.isArray(codes)) {
              codes.forEach((code) => {
                flattenedCourses.push({ title, code });
              });
            }
          });
        }

        setCourses(flattenedCourses);
        setYearLevels(yearLevelRes.data.yearLevels || []);
        if (flattenedCourses.length === 0) {
          setError("No courses available for your department.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dropdowns. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleReset = () => {
    onTitleChange(null);
    onCodeChange(null);
    onYearLevelChange(null);
  };

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleYearDropdown = () => setIsYearDropdownOpen(prev => !prev);

  const getSelectedText = () => {
    const selected = courses.find(course => course.code === selectedCode);
    return selected ? `${selected.title} - ${selected.code}` : "Course";
  };

  const getSelectedYearLevel = () => selectedYearLevel || "Year Level";

  return (
    <div className="eie-head-student-dropdown-container">
    {isLoading ? (
      <p>Loading dropdowns...</p>
    ) : (
      <>
      {/* Course Dropdown */}
      <div className="student-dropdown-wrapper">
      <button className="student-dropdown-btn" onClick={toggleDropdown}>
      {getSelectedText()}
      <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} />
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

      {/* Year Level Dropdown */}
      <div className="student-dropdown-wrapper">
      <button className="student-dropdown-btn" onClick={toggleYearDropdown}>
      {getSelectedYearLevel()}
      <FaChevronDown className={`dropdown-arrow ${isYearDropdownOpen ? "open" : ""}`} />
      </button>
      {isYearDropdownOpen && (
        <div className="student-dropdown-menu">
        {yearLevels.length === 0 ? (
          <p className="student-dropdown-item">No year levels</p>
        ) : (
          yearLevels.map((level, index) => (
            <p
            key={index}
            className={`student-dropdown-item ${selectedYearLevel === level ? "selected" : ""}`}
            onClick={() => {
              onYearLevelChange(level);
              setIsYearDropdownOpen(false);
            }}
            >
            {level}
            </p>
          ))
        )}
        </div>
      )}
      </div>

      {/* Reset Button */}
      <div className="reset-filter" onClick={handleReset}>
      Reset Selection
      </div>
      </>
    )}
    </div>
  );
};

export default StudentManagementDropdown;
