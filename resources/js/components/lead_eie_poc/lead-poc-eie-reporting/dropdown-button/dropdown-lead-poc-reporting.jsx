import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoRefresh } from "react-icons/io5";
import axios from "axios";
import "./dropdown-lead-poc-reporting.css";
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
                const selectedYear = schoolYearList[0]; // Use the first fetched school year
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

        fetchDepartments(); // Fetch departments first
        fetchSchoolYears(currentMonth); // Then fetch school years
    }, []);

    const handleRefresh = async () => {
        setLoading(true); // Start the loading state
        setError(null); // Reset any previous error

        try {
            // Call API to refresh data
            const reportResponse = await apiService.post('/eie-reports/store-or-update');
            window.location.reload();  // Refreshes the page
        } catch (reportError) {
            console.error("Failed to update EIE Reports: ", reportError);
            setError('Failed to update reports');
        } finally {
            setLoading(false); // Ensure loading state is reset after the process completes
        }
    };

    return (
        <div className="esl-dashboard-controls">
        <div className="esl-dashboard-dropdown-container">

        {/* School Year Dropdown */}
        <div className="esl-dashboard-dropdown-wrapper">
        <button
        className="esl-dashboard-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        >
        {schoolYear ? schoolYear.replace('/', '-') : "Select School Year"}
        <FaChevronDown className={`esl-dashboard-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`} />
        </button>
        {isSchoolYearOpen && (
            <div className="esl-dashboard-dropdown-menu">
            {schoolYears.length > 0 ? (
                schoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`esl-dashboard-dropdown-item ${schoolYear === year ? "esl-dashboard-selected" : ""}`}
                    onClick={() => {
                        setSchoolYear(year);
                        setSelectedSchoolYear(year);
                        setIsSchoolYearOpen(false);
                    }}
                    >
                    {year}
                    </p>
                ))
            ) : (
                <p className="esl-dashboard-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        {/* Semester Dropdown */}
        <div className="esl-dashboard-dropdown-wrapper">
        <button className="esl-dashboard-dropdown-btn" onClick={() => setIsSemesterOpen((prev) => !prev)}>
        {semester || "Select Semester"}
        <FaChevronDown className={`esl-dashboard-dropdown-arrow ${isSemesterOpen ? "open" : ""}`} />
        </button>
        {isSemesterOpen && (
            <div className="esl-dashboard-dropdown-menu">
            {semesters.map((sem, index) => (
                <p
                key={index}
                className={`esl-dashboard-dropdown-item ${semester === sem ? "esl-dashboard-selected" : ""}`}
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
        className="esl-dashboard-refresh-btn"
        onClick={handleRefresh}
        disabled={loading}
        >
        <IoRefresh className="esl-dashboard-refresh-icon" />
        {loading ? 'Refreshing...' : ''}
        </button>
        {/* Custom Tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-black text-sm rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg right-0 mr-4">
        {loading ? 'Refreshing reports...' : 'Click to refresh'}
        </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        </div>
    );
};

export default DashboardDropdown;
