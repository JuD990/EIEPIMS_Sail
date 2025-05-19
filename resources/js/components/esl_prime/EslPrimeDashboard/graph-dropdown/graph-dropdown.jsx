import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoRefresh } from "react-icons/io5";
import axios from "axios";
import "./graph-dropdown.css";
import apiService from "@services/apiServices";

const GraphDropdown = ({
    selectedSchoolYear,
    setSelectedSchoolYear,
    selectedSemester,
    setSelectedSemester
}) => {
    const [isSchoolYearOpen, setIsSchoolYearOpen] = useState(false);
    const [isSemesterOpen, setIsSemesterOpen] = useState(false);
    const [schoolYears, setSchoolYears] = useState([]);
    const semesters = ["1st Semester", "2nd Semester"];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const initializeDefaults = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/getSchoolYears");
            const schoolYearList = response.data;
            setSchoolYears(schoolYearList);

            if (schoolYearList.length > 0) {
                const selectedYear = schoolYearList[0];
                setSelectedSchoolYear(selectedYear);

                if (!selectedSemester || !semesters.includes(selectedSemester)) {
                    const currentMonth = new Date().getMonth() + 1;
                    const defaultSemester = currentMonth >= 8 && currentMonth <= 12
                    ? "1st Semester"
                    : "2nd Semester";
                    setSelectedSemester(defaultSemester);
                }
            }
        } catch (error) {
            console.error("Error fetching school years:", error);
        }
    };

    useEffect(() => {
        initializeDefaults();
    }, []);

    const resetFilters = () => {
        if (schoolYears.length > 0) {
            setSelectedSchoolYear(schoolYears[0]);

            const currentMonth = new Date().getMonth() + 1;
            const defaultSemester = currentMonth >= 8 && currentMonth <= 12
            ? "1st Semester"
            : "2nd Semester";
            setSelectedSemester(defaultSemester);
        }
    };

    const handleSchoolYearSelect = (year) => {
        setSelectedSchoolYear(year);
        setIsSchoolYearOpen(false);
    };

    const handleSemesterSelect = (sem) => {
        setSelectedSemester(sem);
        setIsSemesterOpen(false);
    };

    const formattedSchoolYear = selectedSchoolYear
    ? selectedSchoolYear.replace("/", "-")
    : "Select School Year";

    return (
        <div className="eie-head-graph-controls">
        <div className="eie-head-graph-dropdown-container">

        {/* Reset Filters */}
        <div className="eie-head-reset-link-container">
        <a
        href="#"
        className="eie-head-reset-link"
        onClick={(e) => {
            e.preventDefault();
            resetFilters();
        }}
        >
        Reset Filters
        </a>
        </div>

        {/* School Year Dropdown */}
        <div className="eie-head-graph-dropdown-wrapper">
        <button
        type="button"
        className="eie-head-graph-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isSchoolYearOpen}
        >
        {formattedSchoolYear}
        <FaChevronDown
        className={`eie-head-graph-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`}
        />
        </button>
        {isSchoolYearOpen && (
            <div
            className="eie-head-graph-dropdown-menu"
            role="listbox"
            tabIndex={-1}
            >
            {schoolYears.length > 0 ? (
                schoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`eie-head-graph-dropdown-item ${
                        selectedSchoolYear === year ? "eie-head-graph-selected" : ""
                    }`}
                    role="option"
                    aria-selected={selectedSchoolYear === year}
                    onClick={() => handleSchoolYearSelect(year)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSchoolYearSelect(year);
                        }
                    }}
                    >
                    {year.replace("/", "-")}
                    </p>
                ))
            ) : (
                <p className="eie-head-graph-dropdown-item">No School Years</p>
            )}
            </div>
        )}
        </div>

        {/* Semester Dropdown */}
        <div className="eie-head-graph-dropdown-wrapper">
        <button
        type="button"
        className="eie-head-graph-dropdown-btn"
        onClick={() => setIsSemesterOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isSemesterOpen}
        >
        {selectedSemester || "Select Semester"}
        <FaChevronDown
        className={`eie-head-graph-dropdown-arrow ${isSemesterOpen ? "open" : ""}`}
        />
        </button>
        {isSemesterOpen && (
            <div
            className="eie-head-graph-dropdown-menu"
            role="listbox"
            tabIndex={-1}
            >
            {semesters.map((sem, index) => (
                <p
                key={index}
                className={`eie-head-graph-dropdown-item ${
                    selectedSemester === sem ? "eie-head-graph-selected" : ""
                }`}
                role="option"
                aria-selected={selectedSemester === sem}
                onClick={() => handleSemesterSelect(sem)}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSemesterSelect(sem);
                    }
                }}
                >
                {sem}
                </p>
            ))}
            </div>
        )}
        </div>

        {/* Refresh Button */}
        <div className="relative group-1">
        <button
        type="button"
        className="eie-head-dashboard-refresh-btn-1"
        onClick={handleRefresh}
        disabled={loading}
        aria-label={loading ? "Refreshing dashboard" : "Click to refresh"}
        >
        <IoRefresh className="eie-head-dashboard-refresh-icon-1" />
        {loading ? 'Refreshing...' : ''}
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-black text-sm rounded px-2 py-1 z-10 whitespace-nowrap shadow-lg right-0 mr-4">
        {loading ? 'Refreshing dashboard...' : 'Click to refresh'}
        </div>
        </div>

        </div>
        </div>
    );

};

export default GraphDropdown;
