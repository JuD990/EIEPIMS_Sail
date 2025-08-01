import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import { pdf } from "@react-pdf/renderer";
import LandscapeCertificate from "./LandscapeCertificate";
import "./EIEDiagnostics.css";
import uncLogo from "@assets/unc-logo.png";
import DiagnosticsDropdown from "./DiagnosticsDropdown";
import apiService from "@services/apiServices";

const EIEDiagnostics = () => {
    const [department, setDepartment] = useState("");
    const [schoolYear, setSchoolYear] = useState("");
    const [yearLevel, setYearLevel] = useState("");
    const [diagnosticData, setDiagnosticData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            // Get the employee_id from localStorage
            const employee_id = localStorage.getItem("employee_id");

            // If employee_id exists, proceed to fetch data
            const response = await apiService.get("/diagnostics-students", {
                params: {
                    search: searchQuery,
                    department,
                    year_level: yearLevel,
                    school_year: schoolYear,
                    show_status: "Showed Up",
                    employee_id: employee_id,
                },
            });

            const formattedData = response.data.reports.map((item) => {
                // Pronunciation, Grammar, and Fluency scores
                const pronunciation = parseFloat(item.pronunciation_average || 0);
                const grammar = parseFloat(item.grammar_average || 0);
                const fluency = parseFloat(item.fluency_average || 0);

                // Calculate the average score of the three
                const avg = (pronunciation + grammar + fluency) / 3;

                // Proficiency levels for each field
                const pronunciationLevel = getProficiencyLevel(pronunciation).level.toUpperCase();
                const grammarLevel = getProficiencyLevel(grammar).level.toUpperCase();
                const fluencyLevel = getProficiencyLevel(fluency).level.toUpperCase();

                // Additional descriptors and ratings
                const pronunciationData = {
                    consistency_descriptor: item.consistency_descriptor || '',
                    consistency_rating: item.consistency_rating || '',
                    clarity_descriptor: item.clarity_descriptor || '',
                    clarity_rating: item.clarity_rating || '',
                    articulation_descriptor: item.articulation_descriptor || '',
                    articulation_rating: item.articulation_rating || '',
                    intonation_and_stress_descriptor: item.intonation_and_stress_descriptor || '',
                    intonation_and_stress_rating: item.intonation_and_stress_rating || '',
                };

                const grammarData = {
                    accuracy_descriptor: item.accuracy_descriptor || '',
                    accuracy_rating: item.accuracy_rating || '',
                    clarity_of_thought_descriptor: item.clarity_of_thought_descriptor || '',
                    clarity_of_thought_rating: item.clarity_of_thought_rating || '',
                    syntax_descriptor: item.syntax_descriptor || '',
                    syntax_rating: item.syntax_rating || '',
                };

                const fluencyData = {
                    quality_of_response_descriptor: item.quality_of_response_descriptor || '',
                    quality_of_response_rating: item.quality_of_response_rating || '',
                    detail_of_response_descriptor: item.detail_of_response_descriptor || '',
                    detail_of_response_rating: item.detail_of_response_rating || '',
                };

                // Determine CEFR level
                const cefrData = getCEFRLevel(avg);
                const cefrFormatted = `${cefrData.level} - ${cefrData.category}`;

                return {
                    ...item,
                    pronunciation,
                    grammar,
                    fluency,
                    pronunciation_average: pronunciation,
                    grammar_average: grammar,
                    fluency_average: fluency,
                    averageRating: avg.toFixed(2),
                    cefr: cefrFormatted,
                    proficiency_level: getProficiencyLevel(avg).level, // Only the level for average
                    department: item.department,
                    full_department: item.full_department,
                    employeeName: response.data.employee_name,
                    pronunciationLevel, // Only level, not the full object
                    grammarLevel, // Only level
                    fluencyLevel, // Only level
                    pronunciationData,
                    grammarData,
                    fluencyData,
                };
            });

            setDiagnosticData(formattedData);
        } catch (error) {
            console.error("Failed to fetch diagnostics:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchQuery, department, schoolYear, yearLevel]);

    // Proficiency levels
    const epgfProficiencyLevels = [
        { threshold: 0.00, level: 'Beginning'.toUpperCase() },
        { threshold: 0.50, level: 'Low Acquisition'.toUpperCase() },
        { threshold: 0.75, level: 'High Acquisition'.toUpperCase() },
        { threshold: 1.00, level: 'Emerging'.toUpperCase() },
        { threshold: 1.25, level: 'Low Developing'.toUpperCase() },
        { threshold: 1.50, level: 'High Developing'.toUpperCase() },
        { threshold: 1.75, level: 'Low Proficient'.toUpperCase() },
        { threshold: 2.00, level: 'Proficient'.toUpperCase() },
        { threshold: 2.25, level: 'High Proficient'.toUpperCase() },
        { threshold: 2.50, level: 'Advanced'.toUpperCase() },
        { threshold: 3.00, level: 'High Advanced'.toUpperCase() },
        { threshold: 4.00, level: 'Native/Bilingual'.toUpperCase() },
    ];

    // Get proficiency level based on average rating
    const getProficiencyLevel = (epgfAverage) => {
        for (let i = 0; i < epgfProficiencyLevels.length; i++) {
            const current = epgfProficiencyLevels[i];
            const previous = epgfProficiencyLevels[i - 1];

            if (
                (previous ? epgfAverage > previous.threshold : true) &&
                epgfAverage <= current.threshold
            ) {
                const textColor = current.color === '#FFCD56' ? 'black' : 'white';
                return { level: current.level, color: current.color, textColor: textColor };
            }
        }
        return { level: 'Unknown', color: 'black', textColor: 'white' };
    };

    // Get CEFR level based on average rating
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
            return { level: "?", category: "?" };
        }
    };

    // Filter the data based on the search query and selected year level
    const filteredData = diagnosticData.filter((item) => {
        const fullName = item.name?.toLowerCase() || "";
        const cefrLevel = item.cefr?.toLowerCase() || "";
        const yearLevelValue = item.year_level?.toLowerCase() || "";

        return (
            fullName.includes(searchQuery.toLowerCase()) ||
            cefrLevel.includes(searchQuery.toLowerCase()) ||
            yearLevelValue.includes(searchQuery.toLowerCase())
        );
    });

    // This is the data used for generating the certificate
    const dataForCertificate = [
        {
            lowAcquisition: 0.50,
            highAcquisition: 0.75,
            emerging: 1.00,
            lowDeveloping: 1.25,
            highDeveloping: 1.50,
            lowProficient: 1.75,
            proficient: 2.00,
            highProficient: 2.25,
            advanced: 2.50,
            highAdvanced: 3.00,
            nativeBilingual: 4.00,
        },
    ];

    const handleGenerateCertificate = async (rowData) => {
        const {
            full_department,
            proficiency_level,
            name,
            cefr,
            employeeName,
            pronunciationLevel,
            grammarLevel,
            fluencyLevel,
            pronunciation_average,
            grammar_average,
            fluency_average,
            pronunciationData,
            grammarData,
            fluencyData,
            averageRating,
            ...scores
        } = rowData;

        const currentDate = new Date();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        const formattedDate = `${month}, ${year}`;
        const evaluatorName = employeeName || "Unknown Evaluator";

        const certificate = (
            <LandscapeCertificate
            logo={uncLogo}
            name={name}
            cefr={cefr}
            scores={scores}
            data={dataForCertificate}
            monthYear={formattedDate}
            proficiencyLevel={proficiency_level}
            full_department={full_department}
            evaluatorName={evaluatorName}
            pronunciationLevel={pronunciationLevel}
            grammarLevel={grammarLevel}
            fluencyLevel={fluencyLevel}
            pronunciation_average={pronunciation_average}
            grammar_average={grammar_average}
            fluency_average={fluency_average}
            pronunciationData={pronunciationData}
            grammarData={grammarData}
            fluencyData={fluencyData}
            averageRating={averageRating}
            />
        );

        const blob = await pdf(certificate).toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    const columns = React.useMemo(
        () => [
            { Header: "Name", accessor: "name" },
            { Header: "Student ID", accessor: "student_id" },
            { Header: "Year Level", accessor: "year_level" },
            { Header: "Department", accessor: "department" },
            {
                Header: "Pronunciation",
                accessor: "pronunciation",
                Cell: ({ value }) => {
                    return typeof value === 'number' ? value.toFixed(2) : value; // Ensure decimal format
                },
            },
            {
                Header: "Grammar",
                accessor: "grammar",
                Cell: ({ value }) => {
                    return typeof value === 'number' ? value.toFixed(2) : value; // Ensure decimal format
                },
            },
            {
                Header: "Fluency",
                accessor: "fluency",
                Cell: ({ value }) => {
                    return typeof value === 'number' ? value.toFixed(2) : value; // Ensure decimal format
                },
            },
            { Header: "Average PGF Rating", accessor: "averageRating",},
            { Header: "CEFR", accessor: "cefr" },
            {
                Header: "Proficiency",
                accessor: "proficiency_level",
                Cell: ({ value }) => {
                    return value
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                },
            },
            {
                Header: "Action",
                accessor: "action",
                Cell: ({ row }) => (
                    <button
                    className="monthly-champion-action-btn"
                    onClick={() => handleGenerateCertificate(row.original)}
                    >
                    View Certificate
                    </button>
                ),
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
    } = useTable({ columns, data: diagnosticData });

    return (
        <div>
        <DiagnosticsDropdown
        yearLevel={yearLevel}
        setYearLevel={setYearLevel}
        setDepartment={setDepartment}
        setSchoolYear={setSchoolYear}
        department={department}
        schoolYear={schoolYear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        />
        <div className="monthly-champion-container">
        <div className="monthly-champion-table-container">
        <table {...getTableProps()} className="monthly-champion-table">
        <thead>
        {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`header-${i}`}>
            {headerGroup.headers.map((column, j) => (
                <th
                {...column.getHeaderProps()}
                key={`col-${j}`}
                className="monthly-champion-th"
                >
                {column.render("Header")}
                </th>
            ))}
            </tr>
        ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
            prepareRow(row);
            return (
                <tr {...row.getRowProps()} key={`row-${i}`}>
                {row.cells.map((cell, j) => (
                    <td
                    {...cell.getCellProps()}
                    key={`cell-${j}`}
                    className="monthly-champion-td"
                    >
                    {cell.render("Cell")}
                    </td>
                ))}
                </tr>
            );
        })}
        </tbody>
        </table>
        </div>
        </div>
        </div>
    );
};

export default EIEDiagnostics;
