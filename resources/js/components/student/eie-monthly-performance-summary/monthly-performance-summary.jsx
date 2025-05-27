import React, { useState, useEffect } from "react";
import { useTable } from 'react-table';
import axios from 'axios';
import "./monthly-performance-summary.css";
import DropdownStudent from "./dropdown-student/dropdown-student";

// Updated proficiency levels with color information
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

// Function to determine proficiency level
const getProficiencyLevel = (epgfAverage) => {
    for (let i = 0; i < epgfProficiencyLevels.length; i++) {
        const current = epgfProficiencyLevels[i];
        const previous = epgfProficiencyLevels[i - 1];

        if (
            (previous ? epgfAverage > previous.threshold : true) &&
            epgfAverage <= current.threshold
        ) {
            return { level: current.level, color: current.color };
        }
    }
    return { level: 'Unknown', color: 'black' };
};

// Function to determine CEFR level
const getCEFRLevel = (epgfAverage) => {
    if (epgfAverage >= 1.00 && epgfAverage < 1.50) {
        return { level: "A1", category: "Beginner" };
    } else if (epgfAverage >= 1.50 && epgfAverage < 2.00) {
        return { level: "A2", category: "Elementary" };
    } else if (epgfAverage >= 2.00 && epgfAverage < 2.50) {
        return { level: "B1", category: "Intermediate" };
    } else if (epgfAverage >= 2.50 && epgfAverage < 3.00) {
        return { level: "B2", category: "Upper Intermediate" };
    } else if (epgfAverage >= 3.00 && epgfAverage < 4.00) {
        return { level: "C1", category: "Proficient" };
    } else if (epgfAverage >= 4.00) {
        return { level: "C2", category: "Advanced/Native" };
    } else {
        return { level: "A1", category: "Beginner" };
    }
};

const MonthlyPerformanceSummary = () => {
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Retrieve student_id from localStorage
    const studentId = localStorage.getItem("student_id");

    // Fetch data based on selected values when they change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null); // Reset error before fetching

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/get-monthly-performance-data', {
                    params: {
                        year_level: selectedYearLevel || "",
                        semester: selectedSemester || "",
                        student_id: studentId || "",
                    }
                });

                // Dynamically set the months based on the selected semester
                let months = [];
                if (selectedSemester === "1st Semester") {
                    months = ["August", "September", "October", "November", "December"];
                } else if (selectedSemester === "2nd Semester") {
                    months = ["January", "February", "March", "April", "May"];
                }

                // Extract the months data from the response
                const monthsData = response.data.months || {};
                console.log('Data received:', response.data);

                // Prepare data for table rendering, but exclude rows with null epgf_average
                const tableData = months.map(month => {
                    const epgfAverage = monthsData[month] ? monthsData[month].epgf_average : null;

                    // If epgf_average is null, return just the month name and leave other columns empty
                    if (epgfAverage === null) {
                        return {
                            month,
                            epgf_average: '',
                            proficiencyLevel: '',
                            proficiencyColor: '',
                            cefrRating: '',
                            cefrCategory: ''
                        };
                    }

                    // If epgf_average is not null, process the other data
                    const proficiency = epgfAverage ? getProficiencyLevel(epgfAverage) : { level: 'Unknown', color: 'black' };
                    const cefr = epgfAverage ? getCEFRLevel(epgfAverage) : { level: "BEGINNER", category: "BEGINNER" };

                    return {
                        month,
                        epgf_average: epgfAverage,
                        proficiencyLevel: proficiency.level,
                        proficiencyColor: proficiency.color,
                        cefrRating: cefr.level,
                        cefrCategory: cefr.category,
                    };
                }).filter(item => item !== null); // Filter out null values

                setData(tableData); // Update state with the structured data
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        // Ensure data is fetched when valid year level and semester are selected
        if (selectedYearLevel && selectedSemester && studentId) {
            fetchData(); // Only fetch data when both year level, semester, and student_id are available
        }
    }, [selectedYearLevel, selectedSemester, studentId]);

    // Handle changes for Year Level and Semester dropdowns
    const handleYearLevelChange = (yearLevel) => {
        setSelectedYearLevel(yearLevel); // Update parent state
    };

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester); // Update parent state
    };

    // Define columns for the table
    const columns = React.useMemo(
        () => [
            {
                Header: <span title="Month of the performance data">Month</span>,
                accessor: 'month',
            },
            {
                Header: <span title="EPGF (Extended Pronunciation Grammar Fluency) average score">EPGF Average</span>,
                                  accessor: 'epgf_average',
                                  Cell: ({ value }) => {
                                      const num = parseFloat(value);
                                      return isNaN(num) ? '' : num.toFixed(2);
                                  }
            },
            {
                Header: <span title="Student's assessed proficiency level">Proficiency Level</span>,
                accessor: 'proficiencyLevel',
            },
            {
                Header: <span title="CEFR (Common European Framework of Reference for Languages) rating">CEFR Rating</span>,
                                  accessor: 'cefrRating',
            },
            {
                Header: <span title="CEFR (Common European Framework of Reference for Languages) category based on score">CEFR Category</span>,
                accessor: 'cefrCategory',
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div className="student-monthly-performance-summary-card-1 card-1">
        <div className="card-header" style={{ display: 'flex', alignItems: 'right', justifyContent: 'space-between' }}>
        <h2 className="card-title-1">EIE Monthly Performance Summary</h2>
        {/* Pass the selected values and handlers as props to DropdownStudent */}
        <DropdownStudent
        selectedYearLevel={selectedYearLevel || "All Year Levels"} // Default to "All Year Levels" if no selection
        selectedSemester={selectedSemester || "1st Semester"} // Default to "1st Semester" if no selection
        onYearLevelChange={handleYearLevelChange}
        onSemesterChange={handleSemesterChange}
        />
        </div>
        <div className="card-body">
        {/* Show loading indicator or error message */}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {/* Render table */}
        <table {...getTableProps()}>
        <thead>
        {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
            </tr>
        ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {rows.length > 0 ? (
            rows.map(row => {
                prepareRow(row);
                return (
                    <tr {...row.getRowProps()}>
                    {row.cells.map(cell => {
                        // Apply the text color to the proficiency level cell
                        const style = cell.column.id === 'proficiencyLevel' ? { color: row.original.proficiencyColor } : {};
                        return (
                            <td {...cell.getCellProps()} style={style}>
                            {cell.render('Cell')}
                            </td>
                        );
                    })}
                    </tr>
                );
            })
        ) : (
            <tr>
            <td colSpan={5} style={{ textAlign: 'center', padding: '80px' }}>
            No data available
            </td>
            </tr>
        )}
        </tbody>
        </table>
        </div>
        </div>
    );
};

export default MonthlyPerformanceSummary;
