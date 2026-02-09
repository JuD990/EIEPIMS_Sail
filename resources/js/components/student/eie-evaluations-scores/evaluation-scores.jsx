import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./evaluation-scores.css";
import apiService from "@services/apiServices";

const EvaluationScores = () => {
    const navigate = useNavigate();
    const [selectedCourse, setSelectedCourse] = useState("Select a Course");
    const [courses, setCourses] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]); // This will hold filtered tasks

    useEffect(() => {
        const studentId = localStorage.getItem("student_id");
        if (studentId) {
            apiService.get(`/get-courses?student_id=${studentId}`)
            .then(response => {
                const coursesData = response.data.courses || [];
                const recordsData = response.data.records || []; // Fetch full task records
                setCourses(coursesData); // Set unique course titles
                setTasks(recordsData); // Set all task records
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
        }
    }, []);

    const handleSelectChange = (event) => {
        const selected = event.target.value;
        setSelectedCourse(selected);

        // If 'Select a Course' is chosen, reset filtered tasks to an empty array
        if (selected === "Select a Course") {
            setFilteredTasks([]);
        } else {
            // Filter tasks based on the selected course
            const filtered = tasks.filter(task => task.course_title === selected);
            setFilteredTasks(filtered);
        }
    };

    const navigateToViewScores = (historicalScorecardId) => {
        navigate(`/view-scores/${historicalScorecardId}`);
    };

    return (
        <div className="student-dashboard-card-4 card-4">
        <h2 className="card-title-4">EIE Evaluation Scores</h2>
        <div className="evaluation-scores-dropdown-container">
        <select
        className="evaluation-scores-custom-dropdown"
        value={selectedCourse}
        onChange={handleSelectChange}
        >
        <option value="Select a Course">Select Subject</option>
        {courses.map((course, index) => (
            <option key={index} value={course}>
            {course}
            </option>
        ))}
        </select>
        <span className="evaluation-scores-dropdown-icon">▼</span>
        </div>

        <table className="evaluation-scores-table">
        <thead>
        <tr>
        <th>TASK TITLE</th>
        <th>TYPE</th>
        <th>DATE</th>
        <th></th>
        </tr>
        </thead>
        <tbody>
        {filteredTasks.length === 0 ? (
            <tr>
            <td colSpan="4">No tasks available for the selected course</td>
            </tr>
        ) : (
            filteredTasks.map((task, index) => (
                <tr key={index}>
                <td>{task.task_title}</td>
                <td>{task.type}</td>
                <td>{task.date}</td>
                <td>
                <button
                className="view-score-link"
                onClick={() => navigateToViewScores(task.historical_scorecards_id)}
                >
                View Score
                </button>
                </td>
                </tr>
            ))
        )}
        </tbody>
        </table>
        </div>
    );
};

export default EvaluationScores;
