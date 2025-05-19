import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import "./dropdown.css";

const DiagnosticsDropdown = ({
    department,
    setDepartment,
    attendance,
    setAttendance,
    schoolYear,
    setSchoolYear,
    searchQuery,
    setSearchQuery, // Receive setSearchQuery as a prop
}) => {
    const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);
    const attendanceOptions = ["Showed Up", "No Show"];
    const [schoolYearList, setSchoolYearList] = useState([]);

    useEffect(() => {
        const fetchDepartmentsAndUserDept = async () => {
            try {
                const employeeId = localStorage.getItem("employee_id");
                const userType = localStorage.getItem("userType");

                const [deptRes, userDeptRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/master-class-list-department"),
                    axios.get(`http://localhost:8000/api/employee-department/${userType}/${employeeId}`)
                ]);

                const departmentList = Array.isArray(deptRes.data) ? deptRes.data : [];
                const userDepartment = userDeptRes.data?.department || null; // Adjust based on your API response

                setDepartments(departmentList);

                if (!department) {
                    const matchedDepartment = departmentList.find(dept => dept === userDepartment);
                    setDepartment(matchedDepartment || departmentList[0] || "");
                }
            } catch (error) {
                console.error("Error fetching departments or user department:", error);
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

        fetchDepartmentsAndUserDept();
        fetchSchoolYears();
    }, [department, schoolYear, setDepartment, setSchoolYear]);


    const filteredDepartments = departments.filter(dept => dept.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredSchoolYears = schoolYearList.filter(year => year.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="eie-head-diagnostics-dropdown-controls">
        <div className="eie-head-diagnostics-dropdown-container">

        {/* Attendance Dropdown */}
        <div className="eie-head-diagnostics-dropdown-wrapper">
        <button
        className="eie-head-diagnostics-dropdown-btn"
        onClick={() => setIsAttendanceOpen(prev => !prev)}
        >
        {attendance || "Select Attendance"}
        <FaChevronDown
        className={`eie-head-diagnostics-dropdown-arrow ${isAttendanceOpen ? "open" : ""}`}
        />
        </button>
        {isAttendanceOpen && (
            <div className="eie-head-diagnostics-dropdown-menu">
            {attendanceOptions.map((option, index) => (
                <p
                key={index}
                className={`eie-head-diagnostics-dropdown-item ${attendance === option ? "eie-head-diagnostics-dropdown-selected" : ""}`}
                onClick={() => {
                    setAttendance(option);
                    setIsAttendanceOpen(false);
                }}
                >
                {option}
                </p>
            ))}
            </div>
        )}
        </div>

        {/* School Year Dropdown */}
        <div className="eie-head-diagnostics-dropdown-wrapper">
        <button
        className="eie-head-eie-head-dashboard-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        >
        {schoolYear ? schoolYear.replace("/", "-") : "Select School Year"}
        <FaChevronDown
        className={`eie-head-esl-dashboard-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`}
        />
        </button>
        {isSchoolYearOpen && (
            <div className="eie-head-diagnostics-dropdown-menu">
            {filteredSchoolYears.length > 0 ? (
                filteredSchoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`eie-head-diagnostics-dropdown-item ${schoolYear === year ? "eie-head-diagnostics-dropdown-selected" : ""}`}
                    onClick={() => {
                        setSchoolYear(year);
                        setIsSchoolYearOpen(false);
                    }}
                    >
                    {year}
                    </p>
                ))
            ) : (
                <p className="eie-head-diagnostics-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        {/* Search Input */}
        <div className="eie-head-diagnostics-search-input-container">
        <input
        type=""
        className="eie-head-diagnostics-search-input"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
        </div>
        </div>
        </div>
    );
};

export default DiagnosticsDropdown;
