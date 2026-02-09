import React, { useEffect, useState } from 'react';
import apiService from "@services/apiServices";
import './dropdown-student.css';

const DropdownStudent = ({ onYearLevelChange, onSemesterChange }) => {
    const [yearLevels, setYearLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentYearLevel, setCurrentYearLevel] = useState('');
    const [currentSemester, setCurrentSemester] = useState('');

    // Set semester only once on mount
    useEffect(() => {
        const month = new Date().getMonth();
        const detectedSemester = (month >= 7 && month <= 11) ? "1st Semester" : "2nd Semester";
        setCurrentSemester(detectedSemester);
        onSemesterChange(detectedSemester);
    }, []); // Run once on mount

    // Fetch year levels for the specific student and set default
    useEffect(() => {
        const studentId = localStorage.getItem("student_id");

        if (!studentId) {
            console.error("student_id not found in localStorage.");
            setLoading(false);
            return;
        }

        apiService.get('/student-year-level-options', {
            params: { student_id: studentId }
        })
        .then((response) => {
            const yearLevelsData = Array.isArray(response.data) ? response.data : [];
            setYearLevels(yearLevelsData);
            setLoading(false);

            const firstYearLevel = yearLevelsData[0] || "";
            setCurrentYearLevel(firstYearLevel);
            onYearLevelChange(firstYearLevel);
        })
        .catch((error) => {
            console.error("Error fetching Year Levels:", error);
            setYearLevels([]);
            setLoading(false);
        });
    }, []);


    return (
        <div className="student-dropdown-container">
        <select
        className="student-dropdown1"
        value={currentYearLevel}
        onChange={(e) => {
            const value = e.target.value;
            setCurrentYearLevel(value);
            onYearLevelChange(value);
        }}
        disabled={loading}
        >
        {loading ? (
            <option disabled>Loading...</option>
        ) : yearLevels.length === 0 ? (
            <option disabled>No year levels found</option>
        ) : (
            yearLevels.map((yearLevel) => (
                <option key={yearLevel} value={yearLevel}>
                {yearLevel}
                </option>
            ))
        )}
        </select>

        <select
        className="student-dropdown2"
        value={currentSemester}
        onChange={(e) => {
            const value = e.target.value;
            setCurrentSemester(value);
            onSemesterChange(value);
        }}
        >
        <option value="1st Semester">1st Semester</option>
        <option value="2nd Semester">2nd Semester</option>
        </select>
        </div>
    );
};

export default DropdownStudent;
