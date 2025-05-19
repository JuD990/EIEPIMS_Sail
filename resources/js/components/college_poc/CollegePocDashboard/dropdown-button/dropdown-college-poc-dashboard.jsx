import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoRefresh } from "react-icons/io5";
import axios from "axios";
import "./dropdown-college-poc-dashboard.css";
import apiService from "@services/apiServices";

const DashboardDropdown = ({ setSelectedDepartment, setSelectedSchoolYear, setSelectedSemester }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
    const [department, setDepartment] = useState("");
    const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);
    const [schoolYear, setSchoolYear] = useState("");
    const [isSemesterOpen, setIsSemesterOpen] = useState(false);
    const [semester, setSemester] = useState("");
    const [departments, setDepartments] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const semesters = ["1st Semester", "2nd Semester"];

    const fetchDepartments = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/getDepartmentsOptions");
            const departmentList = Array.isArray(response.data) ? response.data : [];
            setDepartments(departmentList);

            const employeeId = localStorage.getItem("employee_id");
            const userType = localStorage.getItem("userType");

            if (employeeId && userType) {
                try {
                    const userDeptResponse = await axios.get(
                        `http://localhost:8000/api/employee-department/${userType}/${employeeId}`
                    );
                    const userDepartment = userDeptResponse.data.department;

                    if (userDeptResponse.data.success && departmentList.includes(userDepartment)) {
                        setDepartment(userDepartment);
                        setSelectedDepartment(userDepartment);
                    } else if (departmentList.length > 0) {
                        setDepartment(departmentList[0]);
                        setSelectedDepartment(departmentList[0]);
                    }
                } catch (error) {
                    console.error("Error fetching user department:", error);
                    if (departmentList.length > 0) {
                        setDepartment(departmentList[0]);
                        setSelectedDepartment(departmentList[0]);
                    }
                }
            } else if (departmentList.length > 0) {
                setDepartment(departmentList[0]);
                setSelectedDepartment(departmentList[0]);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };

    const fetchSchoolYears = async (currentMonth) => {
        try {
            const response = await axios.get("http://localhost:8000/api/getSchoolYears");
            const schoolYearList = response.data;
            setSchoolYears(schoolYearList);

            if (schoolYearList.length > 0) {
                const selectedYear = schoolYearList[0];
                setSchoolYear(selectedYear);
                setSelectedSchoolYear(selectedYear);

                const startYear = parseInt(selectedYear.split('/')[0], 10);
                if (currentMonth >= 8 && currentMonth <= 12) {
                    setSemester("1st Semester");
                    setSelectedSemester("1st Semester");
                } else {
                    setSemester("2nd Semester");
                    setSelectedSemester("2nd Semester");
                }
            }
        } catch (error) {
            console.error("Error fetching school years:", error);
        }
    };

    useEffect(() => {
        const currentMonth = new Date().getMonth() + 1;
        fetchDepartments();
        fetchSchoolYears(currentMonth);
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        try {
            await apiService.post('/eie-reports/store-or-update');
            window.location.reload();
        } catch (reportError) {
            console.error("Failed to update EIE Reports: ", reportError);
            setError('Failed to update reports');
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        if (departments.length > 0) {
            const defaultDepartment = departments[0];
            setDepartment(defaultDepartment);
            setSelectedDepartment(defaultDepartment);
        }

        if (schoolYears.length > 0) {
            const defaultYear = schoolYears[0];
            setSchoolYear(defaultYear);
            setSelectedSchoolYear(defaultYear);

            const currentMonth = new Date().getMonth() + 1;
            const defaultSemester = (currentMonth >= 8 && currentMonth <= 12) ? "1st Semester" : "2nd Semester";
            setSemester(defaultSemester);
            setSelectedSemester(defaultSemester);
        }
    };

    const handleSchoolYearSelect = (year) => {
        setSchoolYear(year);
        setSelectedSchoolYear(year);
        setIsSchoolYearOpen(false);
    };

    return (
        <div className="college-poc-dashboard-controls">
        <div className="college-poc-dashboard-dropdown-container">

        <div className="college-poc2-reset-link-container">
        <a href="#" className="college-poc2-reset-link" onClick={(e) => {
            e.preventDefault();
            handleResetFilters();
        }}>
        Reset Filters
        </a>
        </div>

        {/* School Year Dropdown */}
        <div className="college-poc-dashboard-dropdown-wrapper">
        <button
        className="college-poc-dashboard-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        >
        {schoolYear ? schoolYear.replace("/", "-") : "Select School Year"}
        <FaChevronDown className={`esl-dashboard-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`} />
        </button>
        {isSchoolYearOpen && (
            <div className="college-poc-dashboard-dropdown-menu">
            {schoolYears.length > 0 ? (
                schoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`college-poc-dashboard-dropdown-item ${
                        schoolYear === year ? "college-poc-dashboard-selected" : ""
                    }`}
                    onClick={() => handleSchoolYearSelect(year)}
                    >
                    {year.replace("/", "-")}
                    </p>
                ))
            ) : (
                <p className="college-poc-dashboard-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        {/* Semester Dropdown */}
        <div className="college-poc-dashboard-dropdown-wrapper">
        <button className="college-poc-dashboard-dropdown-btn" onClick={() => setIsSemesterOpen((prev) => !prev)}>
        {semester || "Select Semester"}
        <FaChevronDown className={`college-poc-dashboard-dropdown-arrow ${isSemesterOpen ? "open" : ""}`} />
        </button>
        {isSemesterOpen && (
            <div className="college-poc-dashboard-dropdown-menu">
            {semesters.map((sem, index) => (
                <p
                key={index}
                className={`college-poc-dashboard-dropdown-item ${semester === sem ? "college-poc-dashboard-selected" : ""}`}
                onClick={() => {
                    setSemester(sem);
                    setSelectedSemester(sem);
                    setIsSemesterOpen(false);
                }}
                >
                {sem}
                </p>
            ))}
            </div>
        )}
        </div>
        </div>

        <div className="relative group">
        <button
        className="college-poc-dashboard-refresh-btn"
        onClick={handleRefresh}
        disabled={loading}
        >
        <IoRefresh className="college-poc-dashboard-refresh-icon" />
        {loading ? 'Refreshing...' : ''}
        </button>
        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-black text-sm rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg right-0 mr-4">
        {loading ? 'Refreshing dashboard...' : 'Click to refresh'}
        </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        </div>
    );

};

export default DashboardDropdown;
