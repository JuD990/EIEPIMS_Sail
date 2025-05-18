import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";
import "./eie-performance-summary.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceSummary = () => {
    const [ratings, setRatings] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [performanceSummary, setPerformanceSummary] = useState(null);

    const studentId = localStorage.getItem("student_id");

    useEffect(() => {
        if (studentId) {
            // Fetch performance summary
            axios.get(`http://127.0.0.1:8000/api/get-performance-summary?student_id=${studentId}`)
            .then((response) => {
                const data = response.data.performance_summary;
                const yearLabels = Object.keys(data); // ['1st Year', '2nd Year', '3rd Year', '4th Year']

                // Map rating values, replacing null with 0
                const ratingValues = yearLabels.map(year => {
                    const epgfAverage = data[year].epgf_average;
                    return epgfAverage === null ? 0 : parseFloat(parseFloat(epgfAverage).toFixed(2));
                });

                setPerformanceSummary(data);

                // Fetch ratings summary
                axios.get(`http://127.0.0.1:8000/api/performance-summary-rating`)
                .then((ratingsResponse) => {
                    const ratingsData = ratingsResponse.data.ratings;
                    setRatings(ratingsData);

                    // Calculate the min and max rating from the ratingsData
                    const ratingValuesFromRatings = ratingsData.map(rating => parseFloat(rating)); // Ensure ratings are numbers
                    const minRating = Math.min(...ratingValuesFromRatings);
                    const maxRating = Math.max(...ratingValuesFromRatings);

                    // Set chart data and options with dynamic min and max values
                    setChartData({
                        labels: yearLabels, // Use only year labels (no "Average" label)
                    datasets: [
                        {
                            label: "Performance Summary",
                            data: ratingValues,
                            borderColor: "#DC2626",
                            backgroundColor: "#DC2626",
                            fill: true,
                            tension: 0.3, // smooths the line slightly
                            pointRadius: 4, // size of the data points
                            pointHoverRadius: 6,
                        },
                    ],
                    options: {
                        responsive: true,
                        legend: {
                            position: "top", // or "bottom"
                            labels: {
                                padding: 1130,
                            },
                        },
                        scales: {
                            y: {
                                min: minRating,
                                max: maxRating,
                                ticks: {
                                    callback: function (value) {
                                        if (typeof value === 'number') {
                                            return value.toFixed(2);
                                        }
                                        return value;
                                    }
                                }
                            },
                        },
                        plugins: {
                            legend: {
                                position: "top", // Or "bottom" if preferred
                                labels: {
                                    padding: 20, // 👈 This adds space between legend and chart
                                },
                            },
                            tooltip: {
                                enabled: true,
                            },
                            datalabels: {
                                display: false,
                            },
                        },
                    }

                    });
                })
                .catch((error) => console.error("Error fetching ratings data:", error));

            })
            .catch((error) => console.error("Error fetching performance summary:", error));
        }
    }, [studentId]);

    return (
        <div className="student-dashboard-card-3 card-3" style={{ display: "flex", flexDirection: "column", alignItems: "left" }}>
        <h2 className="card-title-3" style={{ marginBottom: "20px" }}>EIE Performance Summary</h2>
        <div style={{ width: "100%", paddingTop: '40px' }}>
        {chartData ? <Line data={chartData} options={chartData.options} /> : <p>Loading...</p>}
        </div>
        </div>
    );
};

export default PerformanceSummary;
