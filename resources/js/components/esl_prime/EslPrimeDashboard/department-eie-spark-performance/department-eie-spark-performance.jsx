import React, { useState, useEffect, useRef } from 'react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./department-eie-spark-performance.css";
import GraphDropdown from '../graph-dropdown/graph-dropdown';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

const semesters = ["1st Semester", "2nd Semester"];

const EieSparkPerformance = ({semester}) => {
    const defaultSchoolYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
    const [selectedSemester, setSelectedSemester] = useState(semester || "");
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [pgfMin, setPgfMin] = useState(0);
    const [pgfMax, setPgfMax] = useState(4.0);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const chartRef = useRef(null);
    const [loadingDepartment, setLoadingDepartment] = useState(true);

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

    const yearColorMap = {
        "1st Year": "#66bb6a",
        "2nd Year": "#e6e253",
        "3rd Year": "#42a5f5",
        "4th Year": "#ef5350"
    };

    useEffect(() => {
        const fetchPGFAverages = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/performance-summary-rating");
                const pgfValues = response.data.ratings.map(r => parseFloat(r)).filter(val => !isNaN(val));
                if (pgfValues.length) {
                    setPgfMin(Math.floor(Math.min(...pgfValues) * 10) / 10);
                    setPgfMax(Math.ceil(Math.max(...pgfValues) * 10) / 10);
                }
            } catch (error) {
                console.warn("PGF average fetch failed. Using default axis range.");
            }
        };
        fetchPGFAverages();
    }, []);

    useEffect(() => {
        if (!selectedDepartment?.trim()) return;

        const fetchYearTotals = async () => {
            setLoading(true);
            try {
                // Prepare params object outside of axios call
                const params = {
                    department: selectedDepartment,
                    schoolYear: selectedSchoolYear,
                };

                if (selectedSemester && semesters.includes(selectedSemester)) {
                    params.semester = selectedSemester;
                }

                const { data } = await axios.get("http://127.0.0.1:8000/api/dashboard-report-year-totals", {
                    params,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                console.log(data);

                const { programs, yearProgramTotals } = data;
                if (!programs || !yearProgramTotals) {
                    setErrorMessage("No data found.");
                    return;
                }

                const programKeys = Object.values(programs);
                const yearLevels = Object.keys(yearProgramTotals);

                const barDatasets = yearLevels.map((year) => ({
                    type: 'bar',
                    label: `${year} Completion Rate`,
                    data: programKeys.map(program => {
                        const completionRate = yearProgramTotals[year]?.[program]?.completion_rate;
                        return completionRate && completionRate > 0 ? completionRate : 0;
                    }),
                    backgroundColor: yearColorMap[year] || "#999",
                    yAxisID: "y1",
                    order: 2,
                    datalabels: { display: false }
                }));

                const pgfAverages = programKeys.map(program => {
                    const pgfValues = yearLevels
                    .map(year => parseFloat(yearProgramTotals[year]?.[program]?.epgf_average))
                    .filter(val => !isNaN(val) && val > 0);

                    return pgfValues.length
                    ? parseFloat((pgfValues.reduce((sum, val) => sum + val, 0) / pgfValues.length).toFixed(2))
                    : 0;
                });

                const lineDataset = {
                    type: 'line',
              label: 'PGF Average',
              data: pgfAverages,
              borderColor: "#000000",
              backgroundColor: "#FFFFFF",
              fill: false,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#000000",
              pointBorderColor: "#000000",
              yAxisID: "y",
              order: 1,
              datalabels: { display: true }
                };

                setChartData({
                    labels: programKeys,
                    datasets: [lineDataset, ...barDatasets],
                });

                setErrorMessage('');

            } catch (error) {
                console.error("Error fetching year totals:", error);
                setErrorMessage("Failed to fetch year totals.");
            } finally {
                setLoading(false);
            }
        };

        fetchYearTotals();
    }, [selectedDepartment, selectedSemester, selectedSchoolYear]);

    useEffect(() => {
        if (chartRef.current && chartRef.current.chartInstance) {
            chartRef.current.chartInstance.destroy();
        }
    }, [chartData]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (context) =>
                    context.dataset.type === 'line'
                    ? `${context.dataset.label}: ${context.raw.toFixed(2)}`
                    : `${context.dataset.label}: ${context.parsed.y}%`
                }
            },
            datalabels: {
                anchor: 'end',
                align: (ctx) => ctx.dataset.data[ctx.dataIndex] === 100 ? 'bottom' : 'top',
                formatter: (val, ctx) =>
                    ctx.dataset.type === 'line' ? val.toFixed(2) : `${val}%`,
                    font: { weight: 'bold' },
                    padding: { top: 10, bottom: 10 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: pgfMin,
                max: pgfMax,
                title: { display: false, text: 'PGF Average' },
                ticks: {
                    stepSize: 0.5,
                    callback: (val) => val.toFixed(2)
                }
            },
            y1: {
                beginAtZero: true,
                max: 100,
                title: { display: false, text: 'Completion Rate (%)' },
                ticks: {
                    stepSize: 10,
                    callback: (val) => `${val}%`
                },
                position: 'right',
                grid: { drawOnChartArea: false }
            },
            x: {
                title: { display: false, text: 'Programs' },
                stacked: false
            },
        }
    };

    return (
        <div className="esl-spark-chart-container">
        {loading ? (
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
            Monthly EIE Spark Performance <br/>
            {selectedSemester}, S/Y {selectedSchoolYear.replace('/', '-')}
            </p>
            </div>

            <GraphDropdown
            selectedSchoolYear={selectedSchoolYear}
            setSelectedSchoolYear={setSelectedSchoolYear}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            />

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            <Bar ref={chartRef} data={chartData} options={options} />
            </>
        )}
        </div>
    );
};

export default EieSparkPerformance;
