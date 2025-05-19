import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
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
        className="eie-head-graph-dropdown-btn"
        onClick={() => setIsSchoolYearOpen((prev) => !prev)}
        >
        {formattedSchoolYear}
        <FaChevronDown
        className={`eie-head-graph-dropdown-arrow ${isSchoolYearOpen ? "open" : ""}`}
        />
        </button>
        {isSchoolYearOpen && (
            <div className="eie-head-graph-dropdown-menu">
            {schoolYears.length > 0 ? (
                schoolYears.map((year, index) => (
                    <p
                    key={index}
                    className={`eie-head-graph-dropdown-item ${
                        selectedSchoolYear === year ? "eie-head-graph-selected" : ""
                    }`}
                    onClick={() => handleSchoolYearSelect(year)}
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
        className="eie-head-graph-dropdown-btn"
        onClick={() => setIsSemesterOpen((prev) => !prev)}
        >
        {selectedSemester || "Select Semester"}
        <FaChevronDown
        className={`eie-head-graph-dropdown-arrow ${isSemesterOpen ? "open" : ""}`}
        />
        </button>
        {isSemesterOpen && (
            <div className="eie-head-graph-dropdown-menu">
            {semesters.map((sem, index) => (
                <p
                key={index}
                className={`eie-head-graph-dropdown-item ${
                    selectedSemester === sem ? "eie-head-graph-selected" : ""
                }`}
                onClick={() => handleSemesterSelect(sem)}
                >
                {sem}
                </p>
            ))}
            </div>
        )}
        </div>
        </div>
        </div>
    );
};

export default GraphDropdown;
