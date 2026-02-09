import { useState } from "react";
import "./diagnostics-report.css";

const MonthlyPerformanceSummary = () => {
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Retrieve student_id from localStorage

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
