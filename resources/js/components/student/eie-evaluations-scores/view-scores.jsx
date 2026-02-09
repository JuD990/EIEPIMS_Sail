import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Studentsidebar from "../sidebar/student-sidebar";
import UserInfo from "@user-info/User-info";
import BackIcon from "@assets/Prev.png";
import DropdownLogo from "@assets/dropdown-logo-login.png";
import "./view-scores.css";
import apiService from "@services/apiServices";

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

const getProficiencyLevel = (epgfAverage) => {
    for (let i = 0; i < epgfProficiencyLevels.length; i++) {
        const current = epgfProficiencyLevels[i];
        const previous = epgfProficiencyLevels[i - 1];

        if (
            (previous ? epgfAverage > previous.threshold : true) &&
            epgfAverage <= current.threshold
        ) {
            // If color is yellow, set text color to black
            const textColor = current.color === '#FFCD56' ? 'black' : 'white';
            return { level: current.level, color: current.color, textColor: textColor };
        }
    }
    return { level: 'Unknown', color: 'black', textColor: 'white' };
};


const getCEFRLevel = (epgfAverage) => {
    if (epgfAverage >= 1.00 && epgfAverage < 1.50) {
        return { level: "A1", category: "BEGINNER" };
    } else if (epgfAverage >= 1.50 && epgfAverage < 2.00) {
        return { level: "A2", category: "ELEMENTARY" };
    } else if (epgfAverage >= 2.00 && epgfAverage < 2.50) {
        return { level: "B1", category: "INTERMEDIATE" };
    } else if (epgfAverage >= 2.50 && epgfAverage < 3.00) {
        return { level: "B2", category: "UPPER INTERMEDIATE" };
    } else if (epgfAverage >= 3.00 && epgfAverage < 4.00) {
        return { level: "C1", category: "PROFICIENT" };
    } else if (epgfAverage >= 4.00) {
        return { level: "C2", category: "ADVANCED / Native" };
    } else {
        return { level: "BEGINNER", category: "BEGINNER" };
    }
};

const ViewScores = () => {
    const { historicalScorecardId } = useParams();
    const navigate = useNavigate();
    const [openPanel, setOpenPanel] = useState(null);
    const [scoreDetails, setScoreDetails] = useState(null);

    const navigateToDashboard = () => {
        navigate("/student-dashboard");
    };

    const togglePanel = (panel) => {
        setOpenPanel(openPanel === panel ? null : panel);
    };

    useEffect(() => {
        apiService
        .get(`/get-course-details?historical_scorecards_id=${historicalScorecardId}`)
        .then((response) => {
            setScoreDetails(response.data);
        })
        .catch((error) => {
            console.error("Error fetching score details:", error);
        });
    }, [historicalScorecardId]);

    if (!scoreDetails) {
        return <div>Loading...</div>;
    }

    const epgfAverage = scoreDetails?.epgf_average || 0;
    const { level, color, textColor } = getProficiencyLevel(epgfAverage);
    const { level: cefrLevel, category: cefrCategory } = getCEFRLevel(epgfAverage);

    // Format epgfAverage safely
    const formattedEpgfAverage = !isNaN(epgfAverage) ? epgfAverage.toFixed(2) : "N/A";

    // Helper function to add line breaks after each '-'
    const addLineBreaks = (text) => {
        // Split by '-' and add line break after each occurrence of '-'
        return text.split('-').map((part, index) => {
            // Add a line break after each part except the first one (which does not start with '-')
            if (index > 0) {
                return (
                    <>
                    <br />
                    - {part}
                    </>
                );
            }
            return part; // The first part does not get a '-' at the start
        });
    };

    {/* Panels Container */}
    <div className="panels-container">
    {["Pronunciation", "Grammar", "Fluency"].map((panel, index) => (
        <div key={index}>
        <div className="panel" onClick={() => togglePanel(panel)}>
        <span>{panel}</span>
        <div className="panel-score">
        <p>{scoreDetails[`${panel.toLowerCase()}_average`]}</p>
        <img src={DropdownLogo} alt="Dropdown" />
        </div>
        </div>

        {openPanel === panel && (
            <div className="panel-content">
            <h3>{panel} Details</h3>

            {/* Display specific descriptors for each panel */}
            {panel === "Pronunciation" && (
                <>
                <p><strong>Consistency:</strong> {addLineBreaks(scoreDetails.consistency_descriptor)}</p>
                <p><strong>Clarity:</strong> {addLineBreaks(scoreDetails.clarity_descriptor)}</p>
                <p><strong>Articulation:</strong> {addLineBreaks(scoreDetails.articulation_descriptor)}</p>
                <p><strong>Intonation and Stress:</strong> {addLineBreaks(scoreDetails.intonation_and_stress_descriptor)}</p>
                </>
            )}

            {panel === "Grammar" && (
                <>
                <p><strong>Accuracy:</strong> {addLineBreaks(scoreDetails.accuracy_descriptor)}</p>
                <p><strong>Clarity of Thought:</strong> {addLineBreaks(scoreDetails.clarity_of_thought_descriptor)}</p>
                <p><strong>Syntax:</strong> {addLineBreaks(scoreDetails.syntax_descriptor)}</p>
                </>
            )}

            {panel === "Fluency" && (
                <>
                <p><strong>Quality of Response:</strong> {addLineBreaks(scoreDetails.quality_of_response_descriptor)}</p>
                <p><strong>Detail of Response:</strong> {addLineBreaks(scoreDetails.detail_of_response_descriptor)}</p>
                </>
            )}
            </div>
        )}
        </div>
    ))}
    </div>


    return (
        <div className="view-scores-container">
        <Studentsidebar />
        <UserInfo />
        <br /><br /><br /><br />

        {/* Back Button */}
        <button onClick={navigateToDashboard} className="back-button">
        <img src={BackIcon} alt="Back" />
        <p>Dashboard</p>
        </button>

        {/* Main Card */}
        <div className="main-card">
        {/* Subject Title */}
        <div className="subject-title">{scoreDetails.course_title}</div>

        {/* Cards */}
        <div className="cards-container">
        <div className="top-card">
        <h4>Scores and Evaluation</h4>
        <div className="evaluation-grid">
        <p>PGF Average</p>
        <p className="value large">{formattedEpgfAverage}</p>

        <p>Proficiency</p>
        <p className="value-badge" style={{ backgroundColor: color, color: textColor }}>
        {level}
        </p>

        <p>CEFR Rating</p>
        <p className="value">{cefrLevel}</p>

        <p>CEFR Category</p>
        <p className="value">{cefrCategory}</p>
        </div>
        </div>

        <div className="bottom-card">
        <h4 style={{ marginBottom: "25px" }}>Comment</h4>
        <p
        dangerouslySetInnerHTML={{
            __html: scoreDetails.comment.replace(/\n/g, '<br />')
        }}
        />
        </div>

        </div>

        {/* Date & Type Container */}
        <div className="date-type-container">
        {/* Task Title on Top */}
        <div className="task-title">Task Title: '{scoreDetails.task_title}'</div>

        {/* Date & Type in a Row */}
        <div className="date-type-row">
        <span>Date Evaluated: {scoreDetails.date}</span>
        <span>Type: {scoreDetails.type}</span>
        </div>
        </div>



        {/* Panels Container */}
        <div className="panels-container">
        {["Pronunciation", "Grammar", "Fluency"].map((panel, index) => (
            <div key={panel}> {/* Use `panel` as key */}
            <div className="panel" onClick={() => togglePanel(panel)}>
            <span>{panel}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span></span> {/* Empty to take up space */}
            <span>
            {(scoreDetails[`${panel.toLowerCase()}_average`] || 0).toFixed(2)}
            </span>
            </div>
            <div className="panel-score">
            <img src={DropdownLogo} alt="Dropdown" />
            </div>
            </div>

            {openPanel === panel && (
                <div className="panel-content">
                <h3>{panel} Details</h3>
                {/* Descriptors for each panel */}
                {panel === "Pronunciation" && (
                    <>
                    <p><strong>Consistency:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.consistency_rating}
                    </span>
                    {addLineBreaks(scoreDetails.consistency_descriptor)}
                    </p>
                    <p><strong>Clarity:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.clarity_rating}
                    </span>
                    {addLineBreaks(scoreDetails.clarity_descriptor)}
                    </p>
                    <p><strong>Articulation:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.articulation_rating}
                    </span>
                    {addLineBreaks(scoreDetails.articulation_descriptor)}
                    </p>
                    <p><strong>Intonation and Stress:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.intonation_and_stress_rating}
                    </span>
                    {addLineBreaks(scoreDetails.intonation_and_stress_descriptor)}
                    </p>
                    </>
                )}
                {panel === "Grammar" && (
                    <>
                    <p><strong>Accuracy:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.accuracy_rating}
                    </span>
                    {addLineBreaks(scoreDetails.accuracy_descriptor)}
                    </p>
                    <p><strong>Clarity of Thought:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.clarity_of_thought_rating}
                    </span>
                    {addLineBreaks(scoreDetails.clarity_of_thought_descriptor)}
                    </p>
                    <p><strong>Syntax:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.syntax_rating}
                    </span>
                    {addLineBreaks(scoreDetails.syntax_descriptor)}
                    </p>
                    </>
                )}
                {panel === "Fluency" && (
                    <>
                    <p><strong>Quality of Response:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.quality_of_response_rating}
                    </span>
                    {addLineBreaks(scoreDetails.quality_of_response_descriptor)}
                    </p>
                    <p><strong>Detail of Response:</strong>
                    <span style={{ color: '#DC2626', marginLeft: '5px' }}>
                    {scoreDetails.detail_of_response_rating}
                    </span>
                    {addLineBreaks(scoreDetails.detail_of_response_descriptor)}
                    </p>
                    </>
                )}
                </div>
            )}
            </div>
        ))}
        </div>
        </div>
        <br />
        </div>
    );
};

export default ViewScores;
