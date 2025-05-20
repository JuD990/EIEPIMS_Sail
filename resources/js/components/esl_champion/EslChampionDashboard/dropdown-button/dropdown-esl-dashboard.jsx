import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoRefresh } from "react-icons/io5";
import axios from "axios";
import "./dropdown-esl-dashboard.css";
import apiService from "@services/apiServices";
import settingsIcon from "@assets/settings.png";
import exportIcon from "@assets/export-icon.png";

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
    const [showModal, setShowModal] = useState(false);


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

    const handleClick = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleDeleteClassLists = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete the class lists?");
        if (!isConfirmed) return; // If user cancels, don't proceed

        try {
            await axios.delete("http://localhost:8000/api/data-settings/class-lists");
            alert("Class lists deleted successfully.");
        } catch (error) {
            console.error("Error deleting class lists:", error);
            alert("Failed to delete class lists.");
        }
    };

    const handleTurnNullColumns = async () => {
        const isConfirmed = window.confirm("Are you sure you want to nullify the student score columns?");
        if (!isConfirmed) return; // If user cancels, don't proceed

        try {
            await axios.put("http://localhost:8000/api/data-settings/class-lists/nullify-scores");
            alert("Student score columns nullified successfully.");
        } catch (error) {
            console.error("Error nullifying student scores:", error);
            alert("Failed to nullify student scores.");
        }
    };

    const handleNullifySubjectScores = async () => {
        const isConfirmed = window.confirm("Are you sure you want to nullify the implementing subject scores?");
        if (!isConfirmed) return; // If user cancels, don't proceed

        try {
            await axios.put("http://localhost:8000/api/data-settings/implementing-subjects/nullify-scores");
            alert("Implementing subject scores nullified successfully.");
        } catch (error) {
            console.error("Error nullifying subject scores:", error);
            alert("Failed to nullify subject scores.");
        }
    };

    const handleDeleteScorecard = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete the scorecards?");
        if (!isConfirmed) return; // If user cancels, don't proceed

        try {
            await axios.delete("http://localhost:8000/api/data-settings/scorecard");
            alert("Scorecards deleted successfully.");
        } catch (error) {
            console.error("Error deleting scorecards:", error);
            alert("Failed to delete scorecards.");
        }
    };

    const handleResetFilters = () => {
        if (departments.length > 0) {
            setDepartment(departments[0]);
            setSelectedDepartment(departments[0]);
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

    return (
        <div className="esl-prime-dashboard-controls">
        <div className="esl-prime-dashboard-dropdown-container">
        {/* Department Dropdown */}
        <div className="esl-prime-dashboard-dropdown-wrapper">
        <button className="esl-prime-dashboard-dropdown-btn" onClick={() => setIsDepartmentOpen((prev) => !prev)}>
        {department || "Select Department"}
        <FaChevronDown className={`esl-prime-dashboard-dropdown-arrow ${isDepartmentOpen ? "open" : ""}`} />
        </button>
        {isDepartmentOpen && (
            <div className="esl-prime-dashboard-dropdown-menu">
            {departments.length > 0 ? (
                departments.map((dept, index) => (
                    <p
                    key={index}
                    className={`esl-prime-dashboard-dropdown-item ${department === dept ? "esl-prime-dashboard-selected" : ""}`}
                    onClick={() => {
                        setDepartment(dept);
                        setSelectedDepartment(dept);
                        setIsDepartmentOpen(false);
                    }}
                    >
                    {dept}
                    </p>
                ))
            ) : (
                <p className="esl-prime-dashboard-dropdown-item">No Departments</p>
            )}
            </div>
        )}
        </div>

        {/* School Year Dropdown */}
        <div className="esl-prime-dashboard-dropdown-wrapper">
        <button className="esl-prime-dashboard-dropdown-btn" onClick={() => setIsSchoolYearOpen((prev) => !prev)}>
        {schoolYear || "Select School Year"}
        <FaChevronDown className={`esl-prime-dashboard-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`} />
        </button>
        {isSchoolYearOpen && (
            <div className="esl-prime-dashboard-dropdown-menu">
            {schoolYears.length > 0 ? (
                schoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`esl-prime-dashboard-dropdown-item ${schoolYear === year ? "esl-prime-dashboard-selected" : ""}`}
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
                <p className="esl-prime-dashboard-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        {/* Semester Dropdown */}
        <div className="esl-prime-dashboard-dropdown-wrapper">
        <button className="esl-prime-dashboard-dropdown-btn" onClick={() => setIsSemesterOpen((prev) => !prev)}>
        {semester || "Select Semester"}
        <FaChevronDown className={`esl-prime-dashboard-dropdown-arrow ${isSemesterOpen ? "open" : ""}`} />
        </button>
        {isSemesterOpen && (
            <div className="esl-prime-dashboard-dropdown-menu">
            {semesters.map((sem, index) => (
                <p
                key={index}
                className={`esl-prime-dashboard-dropdown-item ${semester === sem ? "esl-prime-dashboard-selected" : ""}`}
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

        <div className="esl-prime-reset-link-container">
        <a href="#" className="esl-prime-reset-link" onClick={(e) => {
            e.preventDefault();
            handleResetFilters();
        }}>
        Reset Filters
        </a>
        </div>

        </div>

        <div className="flex items-center gap-x-6">
        {/* Refresh Button */}
        <div className="relative group">
        <button
        className="esl-prime-dashboard-refresh-btn"
        onClick={handleRefresh}
        disabled={loading}
        >
        <IoRefresh className="esl-dashboard-refresh-icon" />
        {loading ? 'Refreshing...' : ''}
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white text-black text-sm rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg">
        {loading ? 'Refreshing dashboard...' : 'Click to refresh'}
        </div>
        </div>

        {/* Settings Button */}
        <div className="relative inline-block group mr-10">
        <button
        onClick={handleClick}
        className="bg-none border-none p-0 cursor-pointer"
        aria-label="Settings"
        >
        <img src={settingsIcon} alt="Settings" className="w-11 h-11" />
        </button>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block
        bg-white text-black text-sm rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg">
        Delete Settings
        </span>
        </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        {showModal && (
            <div
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                       display: "flex",
                       justifyContent: "center",
                       alignItems: "center",
                       zIndex: 1000
            }}
            >
            <div
            style={{
                background: "#fff",
                padding: "10px 25px",
                borderRadius: "8px",
                minWidth: "400px",
                maxWidth: "100%",
            }}
            >
            <h2 style={{ marginTop: "20px" }}>Delete Settings</h2>
            <form>
            {/* Delete ClassLists Section */}
            <div style={{ marginBottom: "20px" }}>
            <h3>Delete ClassLists</h3>
            <p>This action will delete the entire ClassList but will not affect student accounts.</p>
            <button
            type="button"
            onClick={handleDeleteClassLists}
            style={{
                backgroundColor: "#F87171",  // Light red background
                color: "#fff",
                border: "1px solid #F87171",  // Same light red border
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
            }}
            >
            Delete ClassLists
            </button>
            </div>

            {/* Nullify Student Scores Columns Section */}
            <div style={{ marginBottom: "20px" }}>
            <h3>Nullify Student Scores Columns</h3>
            <p>This will nullify the following student score columns in the ClassLists: pronunciation, grammar, fluency, epgf_average, and proficiency_level only.</p>
            <button
            type="button"
            onClick={handleTurnNullColumns}
            style={{
                backgroundColor: "#F87171",  // Light red background
                color: "#fff",
                border: "1px solid #F87171",  // Same light red border
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
            }}
            >
            Nullify Student Scores Columns
            </button>
            </div>

            {/* Nullify Implementing Subjects Average Scores Section */}
            <div style={{ marginBottom: "20px" }}>
            <h3>Nullify Implementing Subjects Scores</h3>
            <p>This will nullify the following columns in ImplementingSubjects: epgf_average, proficiency_level, and completion_rate only.</p>
            <button
            type="button"
            onClick={handleNullifySubjectScores}
            style={{
                backgroundColor: "#F87171",  // Light red background
                color: "#fff",
                border: "1px solid #F87171",  // Same light red border
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
            }}
            >
            Nullify Implementing Subjects Scores
            </button>
            </div>

            {/* Delete Scorecard Section */}
            <div style={{ marginBottom: "20px" }}>
            <h3>Delete Scorecard</h3>
            <p>This action will delete the entire scorecard but will not affect the individual scores in ImplementingSubjects.</p>
            <button
            type="button"
            onClick={handleDeleteScorecard}
            style={{
                backgroundColor: "#F87171",  // Light red background
                color: "#fff",
                border: "1px solid #F87171",  // Same light red border
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
            }}
            >
            Delete Scorecard
            </button>
            </div>

            {/* Cancel Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
            type="button"
            onClick={handleClose}
            style={{
                marginRight: "-10px",
                backgroundColor: "grey",
                color: "#fff",
                border: "1px solid grey",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
            }}
            >
            Done
            </button>
            </div>
            </form>
            </div>
            </div>
        )}

        </div>
    );
};

export default DashboardDropdown;
