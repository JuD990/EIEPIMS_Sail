import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import RemarksDropdown from '../remarks-templates/dropdown-remarks';

const InterviewScorecardButtons = ({
    onClear,
    overallAverage,
    ratings,
    remarks,
    setRemarks,
    categoryAverages,
    formData,
    setFormData,
    currentDate,
    currentTime,
    students,
    departments,
    isDropdownOpen,
    setIsDropdownOpen,
    handleInputChange,
    filteredStudents,
    nameSearch,
    setNameSearch,
    handleStudentSelect
}) => {

    const collectAllInputs = () => {
        return {
            ...formData,
            date_of_interview: currentDate,
            time_of_interview: currentTime,
            year_level: formData.yearLevel,
            venue: formData.venue,
        };
    };

    const studentId = formData.student_id; // use this for update !!!!!!!

    const handleSave = async () => {
        const { department, yearLevel, name } = formData;

        if (!department || !yearLevel || !name) {
            alert("Please select Department, Year Level, and Name before saving.");
            return;
        }

        const flattenRemarks = (obj) => {
            const flat = {};
            for (const [key, value] of Object.entries(obj)) {
                const keyName = key.toLowerCase().replace(/\s+/g, '_');
                if (typeof value === "object" && value !== null) {
                    flat[`${keyName}_rating`] = value.rating || "";
                    flat[`${keyName}_explanation`] = value.explanation || "";
                } else {
                    flat[keyName] = value || "";
                }
            }
            return flat;
        };

        const flatRemarks = flattenRemarks(remarks);
        const flatRatings = flattenRemarks(ratings);

        const collectedData = {
            ...collectAllInputs(),
            ...flatRatings,
            ...flatRemarks,
            consistency_descriptor: ratings.Consistency?.descriptor || 'No description provided',
            consistency_rating: ratings.Consistency?.rating ?? 0,
            clarity_descriptor: ratings.Clarity?.descriptor || 'No description provided',
            clarity_rating: ratings.Clarity?.rating ?? 0,
            articulation_descriptor: ratings.Articulation?.descriptor || 'No description provided',
            articulation_rating: ratings.Articulation?.rating ?? 0,
            intonation_and_stress_descriptor: ratings["Intonation & Stress"]?.descriptor || 'No description provided',
            intonation_and_stress_rating: ratings["Intonation & Stress"]?.rating ?? 0,
            accuracy_descriptor: ratings.Accuracy?.descriptor || 'No description provided',
            accuracy_rating: ratings.Accuracy?.rating ?? 0,
            clarity_of_thought_descriptor: ratings["Clarity of Thought"]?.descriptor || 'No description provided',
            clarity_of_thought_rating: ratings["Clarity of Thought"]?.rating ?? 0,
            syntax_descriptor: ratings.Syntax?.descriptor || 'No description provided',
            syntax_rating: ratings.Syntax?.rating ?? 0,
            grammar_average: categoryAverages?.Grammar ?? 0,
            pronunciation_average: categoryAverages?.Pronunciation ?? 0,
            fluency_average: categoryAverages?.Fluency ?? 0,
            quality_of_response_descriptor: ratings["Quality of Response"]?.descriptor || 'No description provided',
            quality_of_response_rating: ratings["Quality of Response"]?.rating ?? 0,
            detail_of_response_descriptor: ratings["Detail of Response"]?.descriptor || 'No description provided',
            detail_of_response_rating: ratings["Detail of Response"]?.rating ?? 0,
            average_pgf_rating: overallAverage ?? 0,
            show_status: 'Showed Up',
        };

        console.log('Data to be sent to backend:', collectedData);

        try {
            if (yearLevel === "4th Year") {
                // Graduating students
                const response = await axios.post('/api/eie-diagnostic-grad-reports', collectedData);
                console.log('Graduating student data saved:', response.data);
            } else {
                // Non-graduating students
                const response = await axios.post('/api/eie-diagnostic-non-grad-reports', collectedData);
                console.log('Non-graduating student data saved:', response.data);
            }
            alert("Data has been successfully saved!");
        } catch (error) {
            console.error('Error saving:', error.response?.data || error);
            alert("There was an error saving the data.");
        }
    };

    // Handle the onClear functionality
    const handleClear = () => {
        setFormData({
            name: "",
            student_id: "",
            interviewer: "",
            venue: "",
            department: "",
            yearLevel: "",
        });
        onClear(); // Calling onClear passed as prop
    };

    const handleNoShow = async () => {
        const { department, yearLevel, name } = formData;

        // Check if any of the required fields are missing
        if (!department || !yearLevel || !name) {
            alert("Please select Department, Year Level, and Name before tagging as 'No Show'.");
            return;
        }

        // Collect necessary data and add 'No Show' status
        const collectedData = {
            ...collectAllInputs(),
            show_status: 'No Show',
        };

        try {
            const response = await axios.post('/api/eie-diagnostic-reports', collectedData);
            console.log('No Show tagged:', response.data);
            alert("No Show has been successfully tagged!");
        } catch (error) {
            console.error('Error tagging No Show:', error.response?.data || error);
            alert("There was an error tagging as 'No Show'.");
        }
    };

    const getCEFRLevel = (overallAverage) => {
        if (overallAverage >= 1.00 && overallAverage < 1.50) {
            return { level: "A1", category: "BEGINNER" };
        } else if (overallAverage >= 1.50 && overallAverage < 2.00) {
            return { level: "A2", category: "ELEMENTARY" };
        } else if (overallAverage >= 2.00 && overallAverage < 2.50) {
            return { level: "B1", category: "INTERMEDIATE" };
        } else if (overallAverage >= 2.50 && overallAverage < 3.00) {
            return { level: "B2", category: "UPPER INTERMEDIATE" };
        } else if (overallAverage >= 3.00 && overallAverage < 4.00) {
            return { level: "C1", category: "PROFICIENT" };
        } else if (overallAverage >= 4.00) {
            return { level: "C2", category: "ADVANCED / Native" };
        } else {
            return { level: "A1", category: "BEGINNER" };
        }
    };

    const cefr = getCEFRLevel(overallAverage);

    return (
        <div>
        <h2>INTERVIEW SCORECARD</h2>
        <div className="esl-interview-scorecard-form-container">
        {/* First Column */}
        <div className="esl-interview-scorecard-column">
        {/* Name Dropdown */}
        <div className="esl-interview-scorecard-form-name">
        <label>Name:</label>
        <div className="custom-dropdown">
        <div className="custom-dropdown-selected" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {formData.name || "Select Name"}
        </div>

        {isDropdownOpen && (
            <div className="custom-dropdown-menu">
            <input
            type=""
            className="custom-dropdown-search"
            placeholder="Search name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            />
            <div className="custom-dropdown-options">
            {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => {
                    const fullName = `${student.firstname} ${student.middlename || ""} ${student.lastname}`.trim();
                    return (
                        <div
                        key={idx}
                        className="custom-dropdown-option"
                        onClick={() => handleStudentSelect(student)}
                        >
                        {fullName}
                        </div>
                    );
                })
            ) : (
                <div className="custom-dropdown-option disabled">No students found</div>
            )}
            </div>
            </div>
        )}
        </div>
        </div>

        {/* Venue Dropdown */}
        <div className="esl-interview-scorecard-form-venue">
        <label>Venue:</label>
        <select
        className="esl-interview-scorecard-input"
        name="venue"
        value={formData.venue}
        onChange={handleInputChange}
        >
        <option value="Online">Online</option>
        <option value="Mobile">Mobile</option>
        <option value="F2F">F2F</option>
        </select>
        </div>


        {/* Time */}
        <div className="esl-interview-scorecard-form-time">
        <label>Time:</label>
        <div className="esl-interview-scorecard-input-icon-time">
        <input
        type="time"
        className="esl-interview-scorecard-input"
        value={formData.time}
        readOnly
        />
        <FontAwesomeIcon
        icon={faClock}
        className="esl-interview-scorecard-icon"
        />
        </div>
        </div>
        </div>

        {/* Second Column */}
        <div className="esl-interview-scorecard-column">
        {/* Department Dropdown */}
        <div className="esl-interview-scorecard-form-department">
        <label>Department:</label>
        <select
        className="esl-interview-scorecard-select-department"
        name="department"
        value={formData.department}
        onChange={handleInputChange}
        >
        <option value="">Select Department</option>
        {departments.map((dept, idx) => (
            <option key={idx} value={dept}>
            {dept}
            </option>
        ))}
        </select>
        </div>

        <div className="esl-interview-scorecard-form-year-level">
        <label>Year Level:</label>
        <select
        className="esl-interview-scorecard-select-year-level"
        name="yearLevel"
        value={formData.yearLevel}
        onChange={handleInputChange}
        >
        <option value="">Select Year Level</option>
        <option value="1st Year">Freshmen</option>
        <option value="2nd Year">Sophomore</option>
        <option value="3rd Year">Junior</option>
        <option value="4th Year">Graduating</option>
        </select>
        </div>

        {/* Date */}
        <div className="esl-interview-scorecard-form-date">
        <label>Date:</label>
        <div className="esl-interview-scorecard-input-icon">
        <input
        type="date"
        className="esl-interview-scorecard-input"
        value={formData.date}
        readOnly
        />
        <FontAwesomeIcon
        icon={faCalendarAlt}
        className="esl-interview-scorecard-icon"
        />
        </div>
        </div>
        </div>

        {/* Buttons Row */}
        <div className="esl-buttons-rating">
        <button className="esl-no-show-button" onClick={handleNoShow}>Tagged as “No Show”</button>
        <div className="esl-interview-scorecard-buttons-row">
        <button className="esl-clear-button" onClick={handleClear}>
        Clear
        </button>
        <button className="esl-save-button" onClick={handleSave}>
        Save
        </button>
        </div>

        {/* Average Rating */}
        <div className="esl-average-rating-box">
        <label>Average Rating: {overallAverage}</label>
        </div>
        {/* CEFR Level */}
        <div className="esl-cefr-rating-box">
        <label>{cefr.level} - {cefr.category}</label>
        </div>
        </div>
        </div>
        </div>
    );
};

export default InterviewScorecardButtons;
