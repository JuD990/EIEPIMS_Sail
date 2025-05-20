import React, { useState, useEffect, useRef } from "react";
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
import GraphDropdown from '../graph-dropdown/graph-dropdown';
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

const semesterMonths = {
    "1st Semester": ["August", "September", "October", "November", "December"],
    "2nd Semester": ["January", "February", "March", "April", "May"],
};

const generateEmptyChartData = (semester) => ({
    labels: semesterMonths[semester],
    datasets: [
        {
            type: "line",
            label: "EPGF Average",
            data: Array(semesterMonths[semester].length).fill(0),
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
            datalabels: { display: false },
        },
        {
            type: "bar",
            label: "Completion Rate",
            data: Array(semesterMonths[semester].length).fill(0),
            backgroundColor: "#42a5f5",
            order: 2,
            yAxisID: "y2",
            datalabels: { display: false },
        },
    ],
});

const ImpSubjectsPerformance = () => {
    const currentMonth = new Date().getMonth();
    const defaultSemester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";

    const defaultSchoolYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
    const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
    const [chartData, setChartData] = useState(generateEmptyChartData(defaultSemester));
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [pgfMin, setPgfMin] = useState(0.0);
    const [pgfMax, setPgfMax] = useState(4.0);
    const [loadingDepartment, setLoadingDepartment] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const chartRef = useRef(null);

    useEffect(() => {
        axios.get('/api/get-full-departments')
        .then(response => {
            const fetched = Array.isArray(response.data) ? response.data : [];
            setDepartments(fetched);
            setSelectedDepartment(fetched.length > 0 ? fetched[0].department : '');
            setLoadingDepartment(false);
        })
        .catch(error => {
            console.error(error);
            setDepartments([]);
            setErrorMessage('Failed to load departments');
            setLoadingDepartment(false);
        });
    }, []);

    useEffect(() => {
        const fetchPGFAverages = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://127.0.0.1:8000/api/performance-summary-rating");
                const ratingsData = response.data.ratings;
                const pgfValues = ratingsData.map(r => parseFloat(r)).filter(val => !isNaN(val));

                if (pgfValues.length > 0) {
                    setPgfMin(Math.floor(Math.min(...pgfValues) * 10) / 10);
                    setPgfMax(Math.ceil(Math.max(...pgfValues) * 10) / 10);
                } else {
                    setPgfMin(0.0);
                    setPgfMax(4.0);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching PGF Averages:", error);
                setErrorMessage("Failed to fetch PGF Averages");
                setLoading(false);
            }
        };

        fetchPGFAverages();
    }, []);

    useEffect(() => {
        if (!selectedDepartment || selectedDepartment.trim() === "") {
            console.log("Waiting for valid userDepartment...");
            return;
        }

        setLoadingDepartment(false);

        const fetchGrandTotals = async () => {
            setLoading(true);
            try {
                const formattedSchoolYear = selectedSchoolYear.replace('-', '/');
                const baseUrl = window.env?.API_BASE_URL || "http://127.0.0.1:8000";
                const response = await axios.get(`${baseUrl}/dashboard-report-grand-totals`, {
                    params: {
                        department: selectedDepartment,
                        semester: selectedSemester,
                        schoolYear: formattedSchoolYear,
                    },
                });

                const grandTotals = response.data.grandTotals;

                if (!grandTotals?.completionRate || !grandTotals?.epgfAverage) {
                    throw new Error("Missing data in response");
                }

                const updatedCompletionRate = semesterMonths[selectedSemester].reduce((acc, month) => {
                    acc[month] = grandTotals.completionRate[month] ?? 0;
                    return acc;
                }, {});

                const updatedEpgfAverage = semesterMonths[selectedSemester].reduce((acc, month) => {
                    acc[month] = grandTotals.epgfAverage[month] ?? 0.0;
                    return acc;
                }, {});

                setChartData({
                    labels: semesterMonths[selectedSemester],
                    datasets: [
                        {
                            type: "line",
                            label: "EPGF Average",
                            data: semesterMonths[selectedSemester].map(month => updatedEpgfAverage[month]),
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
                             datalabels: { display: false },
                        },
                        {
                            type: "bar",
                            label: "Completion Rate",
                            data: semesterMonths[selectedSemester].map(month => updatedCompletionRate[month]),
                             backgroundColor: "#42a5f5",
                             order: 2,
                             yAxisID: "y2",
                             datalabels: { display: false },
                        },
                    ],
                });

            } catch (error) {
                console.error("Error fetching grand totals:", error);
                setErrorMessage("No Data Available.");
            } finally {
                setLoading(false);
            }
        };

        fetchGrandTotals();
    }, [selectedDepartment, selectedSemester, selectedSchoolYear]);

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
        setChartData(generateEmptyChartData(semester)); // Reset while loading new data
    };

    const handleSchoolYearChange = (schoolYear) => {
        setSelectedSchoolYear(schoolYear);
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        if (context.dataset.yAxisID === 'y2') {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                        if (context.dataset.yAxisID === 'y1') {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                        return '';
                    },
                },
            },
        },
        scales: {
            y1: {
                type: "linear",
                position: "left",
                min: pgfMin,
                max: pgfMax,
                ticks: { stepSize: 0.5, display: true },
                title: { display: false, text: "PGF Average" },
                grid: { drawOnChartArea: false },
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
                title: { display: false, text: "Completion Rate (%)" },
            },
        },
    };

    return (
        <div className="chart-container">
        {loadingDepartment ? (
            <p>Loading...</p>
        ) : !Array.isArray(departments) || departments.length === 0 ? (
            <p className="text-gray-600">No departments available.</p>
        ) : (
            <>
            <div className="esl-spark-chart-title mb-4">
            <div className="esl-flex items-center gap-4">
            <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="department-dropdown text-gray-800 text-sm"
            >
            {departments.map((dept, idx) => (
                <option key={idx} value={dept.department}>
                {dept.full_department}
                </option>
            ))}
            </select>
            </div>
            <p className="esl-spark-chart-title">
            Monthly Performance <br/>
            {selectedSemester}, S/Y {selectedSchoolYear.replace('/', '-')}
            </p>
            </div>

            <GraphDropdown
            selectedSchoolYear={selectedSchoolYear}
            setSelectedSchoolYear={setSelectedSchoolYear}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            />

            {errorMessage && (
                <p className="text-red-600">{errorMessage}</p>
            )}

            <Chart ref={chartRef} type="bar" data={chartData} options={options} />
            </>
        )}
        </div>
    );
};

export default ImpSubjectsPerformance;
