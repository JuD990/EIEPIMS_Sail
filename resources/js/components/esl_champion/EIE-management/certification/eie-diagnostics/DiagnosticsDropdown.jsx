import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import "./dropdown.css";

const DiagnosticsDropdown = ({
    department,
    setDepartment,
    yearLevel,
    setYearLevel,
    schoolYear,
    setSchoolYear,
    searchQuery,
    setSearchQuery,
}) => {
    const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [isYearLevelOpen, setIsYearLevelOpen] = useState(false);
    const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);

    const yearLevelOptions = [
        { label: "1st Year", value: "1st Year" },
        { label: "4th Year", value: "4th Year" }
    ];

    const [schoolYearList, setSchoolYearList] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/master-class-list-department");
                const departmentList = Array.isArray(response.data) ? response.data : [];
                setDepartments(departmentList);

                if (departmentList.length > 0 && !department) {
                    setDepartment(departmentList[0]);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        const fetchSchoolYears = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/master-class-list-school-year");
                const schoolYearList = response.data;
                setSchoolYearList(schoolYearList);

                if (schoolYearList.length > 0 && !schoolYear) {
                    setSchoolYear(schoolYearList[0]);
                }
            } catch (error) {
                console.error("Error fetching school years:", error);
            }
        };

        fetchDepartments();
        fetchSchoolYears();

        // ✅ Set default Year Level to "1st Year" (Freshmen)
        if (!yearLevel) {
            setYearLevel("1st Year");
        }

    }, [department, schoolYear, yearLevel, setDepartment, setSchoolYear, setYearLevel]);


    return (
        <div className="diagnostics-dropdown-controls">
        <div className="certification-diagnostics-dropdown-container">

        {/* Department Dropdown */}
        <div className="diagnostics-dropdown-wrapper">
        <button className="diagnostics-dropdown-btn" onClick={() => setIsDepartmentOpen(prev => !prev)}>
        {department || "No Department Found"}
        <FaChevronDown className={`diagnostics-dropdown-arrow ${isDepartmentOpen ? "open" : ""}`} />
        </button>
        {isDepartmentOpen && (
            <div className="diagnostics-dropdown-menu">
            {departments.length > 0 ? (
                departments.map((dept, index) => (
                    <p
                    key={index}
                    className={`diagnostics-dropdown-item ${department === dept ? "diagnostics-dropdown-selected" : ""}`}
                    onClick={() => {
                        setDepartment(dept);
                        setIsDepartmentOpen(false);
                    }}
                    >
                    {dept}
                    </p>
                ))
            ) : (
                <p className="diagnostics-dropdown-item">No Departments</p>
            )}
            </div>
        )}
        </div>

        {/* Year Level Dropdown */}
        <div className="diagnostics-dropdown-wrapper">
        <button className="diagnostics-dropdown-btn" onClick={() => setIsYearLevelOpen(prev => !prev)}>
        {yearLevel || "Select Year Level"}
        <FaChevronDown className={`diagnostics-dropdown-arrow ${isYearLevelOpen ? "open" : ""}`} />
        </button>
        {isYearLevelOpen && (
            <div className="diagnostics-dropdown-menu">
            {yearLevelOptions.map((option, index) => (
                <p
                key={index}
                className={`diagnostics-dropdown-item ${yearLevel === option.value ? "diagnostics-dropdown-selected" : ""}`}
                onClick={() => {
                    setYearLevel(option.value);
                    setIsYearLevelOpen(false);
                }}
                >
                {option.label}
                </p>
            ))}
            </div>
        )}
        </div>

        {/* School Year Dropdown */}
        <div className="diagnostics-dropdown-wrapper">
        <button
        className="esl-dashboard-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        >
        {schoolYear ? schoolYear.replace('/', '-') : "Select School Year"}
        <FaChevronDown className={`esl-dashboard-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`} />
        </button>
        {isSchoolYearOpen && (
            <div className="diagnostics-dropdown-menu">
            {schoolYearList.length > 0 ? (
                schoolYearList.map((year, index) => (
                    <p
                    key={index}
                    className={`diagnostics-dropdown-item ${schoolYear === year ? "diagnostics-dropdown-selected" : ""}`}
                    onClick={() => {
                        setSchoolYear(year);
                        setIsSchoolYearOpen(false);
                    }}
                    >
                    {year}
                    </p>
                ))
            ) : (
                <p className="diagnostics-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        <div className="certification-search-container">
        <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className="certification-search-input"
        />
        </div>
        </div>
        </div>
    );
};

export default DiagnosticsDropdown;
