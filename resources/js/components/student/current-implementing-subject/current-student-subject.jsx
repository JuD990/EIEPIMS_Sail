import React, { useEffect, useState } from "react";
import "./student-current-subject.css";
import SomeLogo from "@assets/someLogo.png";

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
        return { level: "C2", category: "Advanced/Native" };
    } else {
        return { level: "?", category: "?" };
    }
};

const CurrentSubjects = () => {
    const [subjectData, setSubjectData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const student_id = localStorage.getItem("student_id");

    useEffect(() => {
        if (student_id) {
            fetch(`http://127.0.0.1:8000/api/current-subjects/${student_id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setSubjectData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                setError(`No Current Subjects`);
                setIsLoading(false);
                console.error("Error fetching subject data:", error);
            });
        } else {
            setError("Student ID not found in local storage.");
            setIsLoading(false);
        }
    }, [student_id]);

    // Calculate proficiency level and CEFR level if epgf_average exists
    let proficiencyLevel = null;
    let cefrLevel = null;
    if (subjectData && subjectData.epgf_average != null) {
        proficiencyLevel = getProficiencyLevel(subjectData.epgf_average);
        cefrLevel = getCEFRLevel(subjectData.epgf_average);
    }

    return (
        <div className="student-current-subject-2 card-2">
        {isLoading ? (
            <p>Loading...</p>
        ) : error ? (
            <p className="error-message">{error}</p>
        ) : subjectData ? (
            <div className="student-subject-container">
            <div className="student-subject-details">
            <h3 className="card-title-2-3">Overall Average - {subjectData.student_id}</h3>
            <br /><br />
            <p><strong>EPGF Average:</strong> {subjectData.epgf_average}</p>
            {proficiencyLevel && (
                <>
                <p>
                <strong>Proficiency Level:</strong>{" "}
                <span style={{ color: proficiencyLevel.color }}>
                {proficiencyLevel.level}
                </span>
                </p>
                <p>
                <strong>CEFR Level:</strong> {cefrLevel.level} - {cefrLevel.category}
                </p>
                </>
            )}
            </div>
            <div className="student-subject-image">
            <img src={""} alt="" />
            </div>
            </div>
        ) : (
            <p>No data available</p>
        )}
        </div>
    );

};

export default CurrentSubjects;
