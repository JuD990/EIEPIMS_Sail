import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import './college-proficiency-distribution.css';
import GraphDropdown from '../graph-dropdown/graph-dropdown';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    LineElement,
    PointElement
);

const CollegeProficiencyChart = () => {
    const defaultSchoolYear = `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(defaultSchoolYear);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pgfMin, setPgfMin] = useState(0);
    const [pgfMax, setPgfMax] = useState(4.0);

    // Default chart data (used also when no data is returned)
    const defaultChartData = {
        labels: ['No Data'],
        datasets: [
            {
                label: 'Beginning',
                data: [0],
                backgroundColor: '#FF474A',
                yAxisID: 'y1',
                order: 2,
            },
            {
                label: 'Developing',
                data: [0],
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                yAxisID: 'y1',
                order: 2,
            },
            {
                label: 'Approaching',
                data: [0],
                backgroundColor: '#0E9E48',
                yAxisID: 'y1',
                order: 2,
            },
            {
                label: 'Proficient',
                data: [0],
                backgroundColor: '#0187F1',
                yAxisID: 'y1',
                order: 2,
            },
            {
                label: 'PGF Average',
                type: 'line',
                data: [0],
                borderColor: '#000000',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y',
                pointBackgroundColor: '#000000',
                tension: 0.3,
                order: 1,
            },
        ],
    };

    const [chartData, setChartData] = useState(defaultChartData);

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
        const fetchProficiencyDistribution = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/api/department-proficiency-distribution'
                );

                if (response.data.success && response.data.data.length > 0) {
                    const data = response.data.data;
                    const fetchedDepartments = data.map((d) => d.department);
                    setDepartments(fetchedDepartments);

                    const beginningData = data.map((d) => d.Beginning || 0);
                    const developingData = data.map((d) => d.Developing || 0);
                    const approachingData = data.map((d) => d.Approaching || 0);
                    const proficientData = data.map((d) => d.Proficient || 0);
                    const pgfAverageData = data.map((d) => d.epgf_average || 0);

                    const dataset = {
                        labels: fetchedDepartments,
                        datasets: [
                            {
                                label: 'Beginning',
                                data: beginningData,
                                backgroundColor: '#FF474A',
                                yAxisID: 'y1',
                                order: 2,
                            },
                            {
                                label: 'Developing',
                                data: developingData,
                                backgroundColor: 'rgba(255, 206, 86, 0.7)',
              yAxisID: 'y1',
              order: 2,
                            },
                            {
                                label: 'Approaching',
                                data: approachingData,
                                backgroundColor: '#0E9E48',
                                yAxisID: 'y1',
                                order: 2,
                            },
                            {
                                label: 'Proficient',
                                data: proficientData,
                                backgroundColor: '#0187F1',
                                yAxisID: 'y1',
                                order: 2,
                            },
                            {
                                label: 'PGF Average',
                                type: 'line',
                                data: pgfAverageData,
                                borderColor: '#000000',
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y',
                                pointBackgroundColor: '#000000',
                                tension: 0.3,
                                order: 1,
                            },
                        ],
                    };

                    setChartData(dataset);
                } else {
                    console.warn("No data received. Falling back to default chart.");
                    setChartData(defaultChartData);
                }
            } catch (error) {
                console.error('Error fetching proficiency distribution:', error);
                setChartData(defaultChartData);
            } finally {
                setLoading(false);
            }
        };

        fetchProficiencyDistribution();
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (context) =>
                    context.dataset.type === 'line'
                    ? `${context.dataset.label}: ${context.raw}`
                    : `${context.dataset.label}: ${context.parsed.y}%`,
                },
            },
            datalabels: {
                anchor: 'end',
                align: (context) =>
                context.dataset.data[context.dataIndex] === 100 ? 'bottom' : 'top',
                formatter: (value, context) =>
                    context.dataset.type === 'line'
                    ? parseFloat(value).toFixed(2)
                    : `${value}%`,
                    font: { weight: 'bold' },
                    padding: { top: 10, bottom: 10 },
                    color: (context) => {
                        const value = context.dataset.data[context.dataIndex];
                        const bgColor = Array.isArray(context.dataset.backgroundColor)
                        ? context.dataset.backgroundColor[context.dataIndex]
                        : context.dataset.backgroundColor;

                        if (value === 100 && ['#0E9E48', '#0187F1', '#FF474A'].includes(bgColor)) {
                            return '#FFFFFF';
                        }
                        return '#000000';
                    },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                min: pgfMin,
                max: pgfMax,
                position: 'left',
                title: { display: false, text: 'PGF Average' },
                ticks: {
                    stepSize: 0.5,
                    callback: (val) => val.toFixed(2),
                },
            },
            y1: {
                beginAtZero: true,
                max: 100,
                position: 'right',
                title: { display: false, text: 'Completion Rate (%)' },
                ticks: {
                    stepSize: 10,
                    callback: (val) => `${val}%`,
                },
                grid: { drawOnChartArea: false },
            },
            x: {
                title: { display: false, text: 'Departments' },
            },
        },
    };

    return (
        <div className="cpd-chart-container">
        <div className="cpd-chart-header">
        <h2 className="cpd-chart-title">College Proficiency Distribution</h2>
        <p className="cpd-chart-subtitle">
        Monthly Performance <br/>
        {selectedSemester || 'All Semesters'}, S/Y {selectedSchoolYear.replace('/', '-')}
        </p>
        </div>
        <GraphDropdown
        selectedSchoolYear={selectedSchoolYear}
        setSelectedSchoolYear={setSelectedSchoolYear}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        />
        {!loading && (
            <>
            {chartData.labels.includes('No Data') && (
                <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No data available for the selected filters.
                </p>
            )}
            <Bar data={chartData} options={options} />
            </>
        )}
        </div>
    );
};

export default CollegeProficiencyChart;
