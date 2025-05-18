import React, { useState, useEffect } from "react";
import { useTable } from 'react-table';
import axios from 'axios';
import "./diagnostics-report.css";

// Updated proficiency levels with color information
const epgfProficiencyLevels = [
    { threshold: 0.00, level: 'Beginning', color: 'red' },
{ threshold: 0.50, level: 'Low Acquisition', color: 'red' },
{ threshold: 0.75, level: 'High Acquisition', color: 'red' },
{ threshold: 1.00, level: 'Emerging', color: '#FFCD56' },
{ threshold: 1.25, level: 'Low Developing', color: '#FFCD56' },
{ threshold: 1.50, level: 'High Developing', color: '#FFCD56' },
{ threshold: 1.75, level: 'Low Proficient', color: '#FFCD56' },
{ threshold: 2.00, level: 'Proficient', color: 'green' },
{ threshold: 2.25, level: 'High Proficient', color: 'green' },
{ threshold: 2.50, level: 'Advanced', color: 'green' },
{ threshold: 3.00, level: 'High Advanced', color: '#00008B' },
{ threshold: 4.00, level: 'Native/Bilingual', color: '#00008B' },
];

// Function to determine proficiency level
const getProficiencyLevel = (epgfAverage) => {
    for (let i = 0; i < epgfProficiencyLevels.length; i++) {
        const current = epgfProficiencyLevels[i];
        const previous = epgfProficiencyLevels[i - 1];

        if (
            (previous ? epgfAverage > previous.threshold : true) &&
            epgfAverage <= current.threshold
        ) {
            return { level: current.level, color: current.color };
        }
    }
    return { level: 'Unknown', color: 'black' };
};

// Function to determine CEFR level
const getCEFRLevel = (epgfAverage) => {
    if (epgfAverage >= 1.00 && epgfAverage < 1.50) {
        return { level: "A1", category: "Beginner" };
    } else if (epgfAverage >= 1.50 && epgfAverage < 2.00) {
        return { level: "A2", category: "Elementary" };
    } else if (epgfAverage >= 2.00 && epgfAverage < 2.50) {
        return { level: "B1", category: "Intermediate" };
    } else if (epgfAverage >= 2.50 && epgfAverage < 3.00) {
        return { level: "B2", category: "Upper Intermediate" };
    } else if (epgfAverage >= 3.00 && epgfAverage < 4.00) {
        return { level: "C1", category: "Proficient" };
    } else if (epgfAverage >= 4.00) {
        return { level: "C2", category: "Advamced/Native" };
    } else {
        return { level: "?", category: "?" };
    }
};

const MonthlyPerformanceSummary = () => {
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Retrieve student_id from localStorage
    const studentId = localStorage.getItem("student_id");

    return (
        <div className="student-monthly-performance-summary-card-5 card-5">
        <div className="card-header-5" style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
        <h2 className="card-title-5">EIE Diagnostics Scores</h2>

        </div>
        <div className="card-body-5">
        {/* Show loading indicator or error message */}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}


        </div>
        </div>
    );
};

export default MonthlyPerformanceSummary;
