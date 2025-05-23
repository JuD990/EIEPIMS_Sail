import React, { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "./imp-subjects-performance.css";
import axios from "axios";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const generateEmptyChartData = (labels) => ({
    labels,
    datasets: [
        {
            type: "line",
            label: "PGF Average",
            data: Array(labels.length).fill(0),
            borderColor: "#FF474A",
            backgroundColor: "#FF474A",
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#FF474A",
            pointBorderColor: "#FF474A",
            order: 1,
            yAxisID: "y1",
        },
        {
            type: "bar",
            label: "Completion Rate",
            data: Array(labels.length).fill(0),
            backgroundColor: "#42a5f5",
            order: 2,
            yAxisID: "y2",
        },
    ],
});

const semesterMonths = {
    "1st Semester": ["August", "September", "October", "November", "December"],
    "2nd Semester": ["January", "February", "March", "April", "May"],
};

const ImpSubjectsPerformance = ({ schoolYear, semester }) => {
    const [chartTitle, setChartTitle] = useState('');
    const [chartData, setChartData] = useState(generateEmptyChartData([]));
    const [classData, setClassData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [pgfMin, setPgfMin] = useState(0.0);
    const [pgfMax, setPgfMax] = useState(4.0);


    useEffect(() => {
        const fetchInitialClassData = async () => {
            try {
                const employee_id = localStorage.getItem("employee_id");

                // Check if employee_id exists
                if (!employee_id) {
                    setErrorMessage("Employee ID is missing.");
                    return;
                }

                // Construct the query string to send schoolYear and semester
                const queryParams = new URLSearchParams({
                    schoolYear: schoolYear,
                    semester: semester,
                });

                const classResponse = await axios.get(
                    `/api/implementing-subject-graph/${employee_id}?${queryParams}`
                );

                if (classResponse.data.success) {
                    const data = classResponse.data.classData;
                    console.log(data);
                    setClassData(data);
                    if (data.length > 0) {
                        setChartTitle(data[0].course_code); // Always reset to the first course in the new data
                    } else {
                        setChartTitle('');
                    }
                } else {
                    setErrorMessage(classResponse.data.message);
                }
            } catch (error) {
                setErrorMessage("Error fetching class data.");
            }
        };

        fetchInitialClassData();
    }, [schoolYear, semester]);  // Run effect when schoolYear or semester change

    useEffect(() => {
        const fetchData = async () => {
            if (!chartTitle || !semester || !schoolYear) return;

            setLoading(true);
            try {
                const ratingsResponse = await axios.get(`http://127.0.0.1:8000/api/performance-summary-rating`);
                const ratingsData = ratingsResponse.data.ratings;
                const pgfValues = ratingsData.map(r => parseFloat(r)).filter(val => !isNaN(val));

                if (pgfValues.length > 0) {
                    setPgfMin(Math.floor(Math.min(...pgfValues) * 10) / 10);
                    setPgfMax(Math.ceil(Math.max(...pgfValues) * 10) / 10);
                }
                
                const reportResponse = await axios.get(`/api/fetch-filtered-eie-reports`, {
                    params: {
                        course_code: chartTitle,
                        semester: semester,
                        school_year: schoolYear,
                    },
                });
                console.log("chartTitle:", chartTitle);
                console.log("semester:", semester);
                console.log("schoolYear:", schoolYear);

                console.log(reportResponse);
                if (!reportResponse.data.success || reportResponse.data.data.length === 0) {

                    setErrorMessage(reportResponse.data.message || "No data found.");
                    setChartData(generateEmptyChartData(semesterMonths[semester]));
                    return;
                }

                const reportData = reportResponse.data.data;
                const labels = [];
                const completionRate = [];
                const pgfAverage = [];

                reportData.forEach((monthData) => {
                    labels.push(monthData.month);

                    if (!monthData.data || monthData.data.length === 0) {
                        completionRate.push(0);
                        pgfAverage.push("0.00");
                    } else {
                        const validCompletionRates = monthData.data
                        .map(item => parseFloat(item.completion_rate))
                        .filter(val => !isNaN(val));

                        const validEPGF = monthData.data
                        .map(item => parseFloat(item.epgf_average))
                        .filter(val => !isNaN(val));

                        const compRate = validCompletionRates.length
                        ? validCompletionRates.reduce((sum, val) => sum + val, 0) / validCompletionRates.length
                        : 0;

                        const epgfAvg = validEPGF.length
                        ? validEPGF.reduce((sum, val) => sum + val, 0) / validEPGF.length
                        : 0;

                        completionRate.push(parseFloat(compRate.toFixed(2)));
                        pgfAverage.push(epgfAvg.toFixed(2));
                    }
                });

                setChartData({
                    labels,
                    datasets: [
                        {
                            type: "line",
                            label: "PGF Average",
                            data: pgfAverage,
                            borderColor: "#FF474A",
                            backgroundColor: "#FF474A",
                            fill: false,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: "#FF474A",
                            pointBorderColor: "#FF474A",
                            order: 1,
                            yAxisID: "y1",
                        },
                        {
                            type: "bar",
                            label: "Completion Rate",
                            data: completionRate,
                            backgroundColor: "#42a5f5",
                            order: 2,
                            yAxisID: "y2",
                        },
                    ],
                });
            } catch (error) {
                setChartData(generateEmptyChartData(semesterMonths[semester]));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chartTitle, semester, schoolYear]);

    const handleTitleChange = (e) => {
        setChartTitle(e.target.value);
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const datasetLabel = context.dataset.label;
                        const value = context.raw;
                        if (datasetLabel === 'Completion Rate') return `Completion Rate: ${value.toFixed(2)}%`;
                        if (datasetLabel === 'PGF Average') return `PGF Average: ${value}`;
                        return `${datasetLabel}: ${value}`;
                    },
                },
            },
            datalabels: { display: false },
        },
        scales: {
            y1: {
                type: "linear",
                position: "left",
                min: pgfMin,
                max: pgfMax,
                ticks: { stepSize: 0.5 },
                title: { display: true, text: "PGF Average" },
            },
            y2: {
                type: "linear",
                position: "right",
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 10,
                    callback: (value) => `${value}%`,
                },
                title: { display: true, text: "Completion Rate" },
            },
        },
        interaction: {
            mode: 'nearest',
            intersect: false,
        },
    };

    return (
        <div className="chart-container">
            {loading && <p>Loading data...</p>}

            <div className="title-dropdown-container">
                <select
                    id="chart-title"
                    value={chartTitle}
                    onChange={handleTitleChange}
                    className="title-dropdown"
                    disabled={classData.length === 0}
                >
                    {classData.length === 0 ? (
                        <option value="">No Assigned Subject</option>
                    ) : (
                        classData.map((course, index) => (
                            <option key={index} value={course.course_code}>
                                {course.course_title} ({course.course_code})
                            </option>
                        ))
                    )}
                </select>
            </div>

            {errorMessage && (
                <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
            )}

            <Chart type="bar" data={chartData} options={options} />

            {chartData.datasets.every(ds => ds.data.every(val => val === 0)) && !loading && (
                <p style={{ textAlign: "center", marginTop: "1rem" }}>
                    No data available for the selected subject and semester.
                </p>
            )}
        </div>
    );
};

export default ImpSubjectsPerformance;
