// (Same imports as before)
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
import "./eie-spark-performance.css";
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

const EieSparkPerformance = ({ userDepartment, userFullDepartment }) => {
    console.log(userFullDepartment);
    const currentMonth = new Date().getMonth();
    const defaultSemester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";
    const defaultSchoolYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

    const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
    const [selectedSemester, setSelectedSemester] = useState(defaultSemester);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [pgfMin, setPgfMin] = useState(0);
    const [pgfMax, setPgfMax] = useState(4.0);
    const chartRef = useRef(null);

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
        if (!userDepartment?.trim()) return;

        const fetchYearTotals = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get("http://127.0.0.1:8000/api/dashboard-report-year-totals", {
                    params: {
                        department: userDepartment,
                        semester: selectedSemester,
                        schoolYear: selectedSchoolYear,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

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
              borderColor: "#ab47bc",
              backgroundColor: "#ab47bc",
              fill: false,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "#ab47bc",
              pointBorderColor: "#ab47bc",
              yAxisID: "y",
              order: 1,
              datalabels: { display: false }
                };

                setChartData({
                    labels: programKeys,
                    datasets: [lineDataset, ...barDatasets],
                });

            } catch (error) {
                console.error("Error fetching year totals:", error);
                setErrorMessage("Failed to fetch year totals.");
            } finally {
                setLoading(false);
            }
        };

        fetchYearTotals();
    }, [userDepartment, selectedSemester, selectedSchoolYear]);

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
            }
        }
    };

    return (
        <div className="spark-chart-container">
        {loading ? (
            <p>Loading...</p>
        ) : (
            <>
            <div className="spark-chart-title">
            <h2>{userFullDepartment}</h2>
            <p> Monthly EIE Spark Performance</p>
            <p>Target Completion Rate: 100%</p>
            </div>
            <GraphDropdown
            selectedSchoolYear={selectedSchoolYear}
            setSelectedSchoolYear={setSelectedSchoolYear}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            />
            {errorMessage && <p>{errorMessage}</p>}
            <Bar ref={chartRef} data={chartData} options={options} />
            </>
        )}
        </div>
    );
};

export default EieSparkPerformance;
