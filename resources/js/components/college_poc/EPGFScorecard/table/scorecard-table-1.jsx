import React, { useMemo, useEffect, useState } from "react";
import { useTable, useGlobalFilter } from "react-table";
import './ClassListTable.css';
import axios from 'axios';
import ClassAverageSummary from '../class-average-summary/class-average-summary';

const ClassListTable = ({ data = [], searchQuery, month, courseCode, taskTitle, studentCount, studentCountActive, evaluatedCount }) => {
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({});
    const [tableData, setTableData] = useState(data);
    const [semester, setSemester] = useState('');
    const [year, setYear] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const checkIfSubmissionExists = async () => {
        try {
            const response = await axios.post('/api/evaluate/check-month', {
                month,
                courseCode
            });

            if (response.data.exists) {
                setIsSubmitDisabled(true);
            } else {
                setIsSubmitDisabled(false);
            }
        } catch (error) {
            console.error("Error checking submission existence:", error);
        }
    };

    useEffect(() => {
        if (month) {
            checkIfSubmissionExists();
        }
    }, [month]);

    const updateMyData = (rowIndex, columnId, value) => {
        setTableData(old =>
        old.map((row, index) => {
            if (index === rowIndex) {
                const updatedRow = { ...row, [columnId]: value };

                if (columnId !== 'comment' && columnId !== 'type') {
                    // Update descriptors and averages when a score changes
                    const rowWithDescriptors = updateDescriptors(updatedRow);
                    const rowWithAverages = recalcAveragesForRow(rowWithDescriptors);
                    return {
                        ...rowWithAverages,
                    };
                }

                // For comment or type, just update that field only
                return updatedRow;
            }
            return row;
        })
        );
    };

    // Function to update the descriptors based on the rating value
    const updateDescriptors = (row) => {
        const newRow = { ...row };

        // Check if the descriptor exists for each category and update it accordingly
        if (row.consistency_rating) {
            newRow.consistency_descriptor = getDescriptorForRating('consistency', row.consistency_rating);
        }
        if (row.clarity_rating) {
            newRow.clarity_descriptor = getDescriptorForRating('clarity', row.clarity_rating);
        }
        if (row.articulation_rating) {
            newRow.articulation_descriptor = getDescriptorForRating('articulation', row.articulation_rating);
        }
        if (row.intonation_and_stress_rating) {
            newRow.intonation_and_stress_descriptor = getDescriptorForRating('intonationStress', row.intonation_and_stress_rating);
        }
        if (row.accuracy_rating) {
            newRow.accuracy_descriptor = getDescriptorForRating('accuracy', row.accuracy_rating);
        }
        if (row.clarity_of_thought_rating) {
            newRow.clarity_of_thought_descriptor = getDescriptorForRating('clarityOfThought', row.clarity_of_thought_rating);
        }
        if (row.syntax_rating) {
            newRow.syntax_descriptor = getDescriptorForRating('syntax', row.syntax_rating);
        }
        if (row.quality_of_response_rating) {
            newRow.quality_of_response_descriptor = getDescriptorForRating('qualityOfResponse', row.quality_of_response_rating);
        }
        if (row.detail_of_response_rating) {
            newRow.detail_of_response_descriptor = getDescriptorForRating('detailOfResponse', row.detail_of_response_rating);
        }

        return newRow;
    };

    // Function to get the descriptor for a specific rating value
    const getDescriptorForRating = (category, rating) => {
        const categoryOptions = options[category] || [];
        const option = categoryOptions.find(opt => opt.rating === rating);
        return option ? option.descriptor : '';
    };

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const res = await axios.get('/api/rubric/active-version');
                const versionString = res.data.version;
                const match = versionString?.match(/^v(\d+)/);
                if (match) setVersion(match[1]);
            } catch (error) {
                console.error("Error fetching version:", error);
            }
        };
        fetchVersion();
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            const categories = [
                'consistency', 'clarity', 'articulation', 'intonationStress', 'accuracy',
                'clarityOfThought', 'syntax', 'qualityOfResponse', 'detailOfResponse'
            ];
            const newOptions = {};
            try {
                await Promise.all(categories.map(async (cat) => {
                    const res = await axios.get(`/api/${cat}/${version}`);
                    newOptions[cat] = res.data.map(item => ({
                        id: item.id,
                        rating: item.rating,
                        descriptor: item.descriptor // Ensure the descriptor is here
                    }));
                }));
                setOptions(newOptions);
            } catch (err) {
                console.error("Error fetching rubric options:", err);
            } finally {
                setLoading(false);
            }
        };
        if (version) fetchOptions();
    }, [version]);

        useEffect(() => {
            const fetchData = async () => {
                if (!month || !courseCode) return;
                setLoading(true);
                try {
                    const res = await axios.get('/api/classlists', {
                        params: { course_code: courseCode, month }
                    });
                    const records = res.data.records || [];
                    const semesterResp = res.data.semester || '';
                    const yearResp = res.data.year || '';
                    setTableData(records);
                    setSemester(semesterResp);
                    setYear(yearResp);
                } catch (err) {
                    console.error("Error fetching class list:", err);
                    setTableData([]);
                    setSemester('');
                    setYear('');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [month, courseCode]);

        const renderDropdown = (category) => ({ value, row, column }) => {
            const currentOptions = options[category] || [];
            const currentOption = currentOptions.find(opt => opt.rating === value);

            return (
                <select
                value={value || ''}
                className="clt-dropdown"
                onChange={e => updateMyData(row.index, column.id, e.target.value)}
                >
                <option value="">Select</option>
                {currentOptions.map(opt => (
                    <option key={opt.id} value={opt.rating}>
                    {opt.rating} {opt.descriptor || 'No descriptor available'}
                    </option>
                ))}
                </select>
            );
        };

        const recalcAveragesForRow = (row) => {
            // Pronunciation average: consistency, clarity, articulation, intonation_and_stress
            const pronunciationValues = [
                Number(row.consistency_rating) || 0,
                Number(row.clarity_rating) || 0,
                Number(row.articulation_rating) || 0,
                Number(row.intonation_and_stress_rating) || 0,
            ];
            const pronunciationFiltered = pronunciationValues.filter(v => v > 0);
            const pronunciation_average = pronunciationFiltered.length
            ? pronunciationFiltered.reduce((a, b) => a + b, 0) / pronunciationFiltered.length
            : 0;

            // Grammar average: accuracy, clarity_of_thought, syntax
            const grammarValues = [
                Number(row.accuracy_rating) || 0,
                Number(row.clarity_of_thought_rating) || 0,
                Number(row.syntax_rating) || 0,
            ];
            const grammarFiltered = grammarValues.filter(v => v > 0);
            const grammar_average = grammarFiltered.length
            ? grammarFiltered.reduce((a, b) => a + b, 0) / grammarFiltered.length
            : 0;

            // Fluency average: quality_of_response, detail_of_response
            const fluencyValues = [
                Number(row.quality_of_response_rating) || 0,
                Number(row.detail_of_response_rating) || 0,
            ];
            const fluencyFiltered = fluencyValues.filter(v => v > 0);
            const fluency_average = fluencyFiltered.length
            ? fluencyFiltered.reduce((a, b) => a + b, 0) / fluencyFiltered.length
            : 0;

            // PGF average: average of fluency_average, grammar_average, pronunciation_average
            const pgfValues = [fluency_average, grammar_average, pronunciation_average].filter(v => v > 0);
            const epgf_average = pgfValues.length
            ? pgfValues.reduce((a, b) => a + b, 0) / pgfValues.length
            : 0;

            return {
                ...row,
                pronunciation_average,
                grammar_average,
                fluency_average,
                epgf_average,
            };
        };
        const processedData = tableData;
        const overallPgfAverage = useMemo(() => {
            // Get epgf_average from each row, including zeros
            const pgfValues = processedData
            .map(row => parseFloat(row.epgf_average) || 0);

            if (pgfValues.length === 0) return 0;

            // Sum all and divide by total count (including zeros)
            const total = pgfValues.reduce((a, b) => a + b, 0);
            return total / pgfValues.length;
        }, [processedData]);


        const epgfProficiencyLevels = [
            { threshold: 0.0, level: 'Beginning', color: '#E23F44' },
            { threshold: 0.5, level: 'Low Acquisition', color: '#E23F44' },
            { threshold: 0.75, level: 'High Acquisition', color: '#E23F44' },
            { threshold: 1.0, level: 'Emerging', color: '#FFCD56' },
            { threshold: 1.25, level: 'Low Developing', color: '#FFCD56' },
            { threshold: 1.5, level: 'High Developing', color: '#FFCD56' },
            { threshold: 1.75, level: 'Low Proficient', color: '#FFCD56' },
            { threshold: 2.0, level: 'Proficient', color: 'green' },
            { threshold: 2.25, level: 'High Proficient', color: 'green' },
            { threshold: 2.5, level: 'Advanced', color: 'green' },
            { threshold: 3.0, level: 'High Advanced', color: '#00008B' },
            { threshold: 4.0, level: 'Native/Bilingual', color: '#00008B' },
        ];

        const getProficiencyLevel = (epgfAverage) => {
            const sorted = [...epgfProficiencyLevels].sort((a, b) => b.threshold - a.threshold);
            for (let level of sorted) {
                if (epgfAverage >= level.threshold) {
                    return { level: level.level, color: level.color };
                }
            }
            return { level: 'Unknown', color: 'black' };
        };


        const columns = useMemo(() => [
            { Header: "No", accessor: (_, i) => i + 1, id: "rowNumber" },
            {
                Header: "Full Name",
                id: "fullName",
                accessor: row => {
                const mid = row.middlename ? `${row.middlename.charAt(0)}.` : "";
                return `${row.lastname}, ${row.firstname} ${mid}`;
                },
                Cell: ({ value }) => <div style={{ textAlign: "left" }}>{value}</div>
            },
            { Header: "Student ID", accessor: "student_id" },
            { Header: "Year Level", accessor: "year_level" },
            { Header: "Program", accessor: "program" },
            {
                Header: "PGF Average",
                accessor: "epgf_average", // keep this if you want sorting by this key
                    Cell: ({ row }) => {
                    const { fluency_average, grammar_average, pronunciation_average } = row.original;

                    const fAvg = parseFloat(fluency_average) || 0;
                    const gAvg = parseFloat(grammar_average) || 0;
                    const pAvg = parseFloat(pronunciation_average) || 0;

                    const values = [fAvg, gAvg, pAvg];
                    const count = values.filter(v => v > 0).length;

                    if (count === 0) return '0.00'; // no valid averages

                    const avg = values.reduce((acc, val) => acc + val, 0) / count;
                    return <strong>{avg.toFixed(2)}</strong>;
                    }
            },
            {
                Header: "Proficiency",
                accessor: "proficiency_level",
                Cell: ({ value, row }) => {
                    const proficiency = getProficiencyLevel(row.original.epgf_average);
                    return (
                        <div
                        style={{
                            backgroundColor: proficiency.color, // Set background color
                            padding: '5px', // Optional padding to make it more visible
                            color: 'white', // Ensure text is readable with white text on colored background
                            borderRadius: '4px' // Optional: Add rounded corners to the background
                        }}
                        >
                        {proficiency.level}
                        </div>
                    );
                }
            },
            {
                Header: "Type",
                accessor: "type",
                Cell: ({ value, row, column }) => (
                    <select
                    value={value || 'Reading'}
                    onChange={e => updateMyData(row.index, column.id, e.target.value)}
                    style={{ width: '100%', border: 'none' }}
                    >
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                    <option value="Listening">Listening</option>
                    </select>
                    )
            },
            { Header: "Consistency", accessor: "consistency_rating", Cell: renderDropdown("consistency") },
            { Header: "Clarity", accessor: "clarity_rating", Cell: renderDropdown("clarity") },
            { Header: "Articulation", accessor: "articulation_rating", Cell: renderDropdown("articulation") },
            { Header: "Intonation and Stress", accessor: "intonation_and_stress_rating", Cell: renderDropdown("intonationStress") },
            {
                Header: "Pronunciation",
                accessor: "pronunciation_average",
                Cell: ({ row }) => {
                    const {
                        consistency_rating,
                        clarity_rating,
                        articulation_rating,
                        intonation_and_stress_rating
                    } = row.original;

                    const values = [
                        Number(consistency_rating) || 0,
                        Number(clarity_rating) || 0,
                        Number(articulation_rating) || 0,
                        Number(intonation_and_stress_rating) || 0,
                        ];

                        const filtered = values.filter(v => v > 0);
                            const avg = filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;

                            // Format average to 2 decimal places
                            return <strong>{avg.toFixed(2)}</strong>;
                }
            },
            { Header: "Accuracy", accessor: "accuracy_rating", Cell: renderDropdown("accuracy") },
            { Header: "Clarity of Thought", accessor: "clarity_of_thought_rating", Cell: renderDropdown("clarityOfThought") },
            { Header: "Syntax", accessor: "syntax_rating", Cell: renderDropdown("syntax") },
            {
                Header: "Grammar",
                accessor: "grammar_average",
                Cell: ({ row }) => {
                    const {
                        accuracy_rating,
                        clarity_of_thought_rating,
                        syntax_rating
                    } = row.original;
                    const values = [
                        Number(accuracy_rating) || 0,
                        Number(clarity_of_thought_rating) || 0,
                        Number(syntax_rating) || 0,
                    ];
                    const filtered = values.filter(v => v > 0);
                    const avg = filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;

                    return <strong>{avg.toFixed(2)}</strong>;
                    }
            },
            { Header: "Quality Of Response", accessor: "quality_of_response_rating", Cell: renderDropdown("qualityOfResponse") },
            { Header: "Detail Of Response", accessor: "detail_of_response_rating", Cell: renderDropdown("detailOfResponse") },
            {
                Header: "Fluency",
                accessor: "fluency_average",
                Cell: ({ row }) => {
                    const {
                        quality_of_response_rating,
                        detail_of_response_rating
                        } = row.original;

                        const values = [
                            Number(quality_of_response_rating) || 0,
                            Number(detail_of_response_rating) || 0,
                            ];

                            const filtered = values.filter(v => v > 0);
                            const avg = filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;

                            return <strong>{avg.toFixed(2)}</strong>;
                }
            },
            {
                Header: "Comment",
                accessor: "comment",
                Cell: ({ value, row, column }) => (
                    <textarea
                        value={value || ''}
                        onChange={e => updateMyData(row.index, column.id, e.target.value)}
                        style={{
                            width: '250px',
                            minHeight: '70px',
                            resize: 'vertical',
                            border: '1px solid #ccc',
                            padding: '5px',
                            borderRadius: '4px'
                            }}
                        />
                )
            }

        ], [options]);

        const {
            getTableProps,
            getTableBodyProps,
            headerGroups,
            rows,
            prepareRow,
            setGlobalFilter
        } = useTable(
            { columns, data: tableData, autoResetGlobalFilter: false },
            useGlobalFilter
        );

        // tableData is the array of student data
        const programCounts = tableData.reduce((acc, row) => {
            const program = row.program;
            if (program) {
                acc[program] = (acc[program] || 0) + 1;
            }
            return acc;
        }, {});

        // convert it into an array of program names and counts
        const programList = Object.entries(programCounts).map(([program, count]) => ({
            program,
            count,
        }));

        // Function to count non-zero epgf_average values
        const getNonZeroEpgfCount = (rows) => {
            // Filter rows where epgf_average is greater than 0
            const nonZeroRows = rows.filter(row => row.original.epgf_average > 0);
            return nonZeroRows.length;
        };

        const submitted = getNonZeroEpgfCount(rows);
        const totalPopulation = tableData.length;
        const completionRate = totalPopulation > 0 ? (submitted / totalPopulation) * 100 : 0;
        const roundedCompletionRate = completionRate.toFixed(2);

        useEffect(() => {
            setGlobalFilter(searchQuery || undefined);
        }, [searchQuery, setGlobalFilter]);

        const handleSaveOrSubmit = async (action = 'save') => {
            if (isSubmitting) return;

            if (action === 'submit') {
                const confirmed = window.confirm("Are you sure you want to submit the data? This action may be final.");
                if (!confirmed) return;
            }

            setIsSubmitting(true);

            try {
                const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;

                const dataWithTaskTitle = tableData.map(record => ({
                    ...record,
                    task_title: taskTitle || "No title",
                    comment: record.comment ?? "No comment",
                    type: record.type || "Reading",
                    course_code: record.course_code || courseCode || "",
                    semester: semester || "",
                    school_year: year || "",
                    version: version || "",
                    month: month || "",
                }));

                const url = `/api/evaluate/${action}`;
                const response = await axios.post(url, { data: dataWithTaskTitle }, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    }
                });

                if (response.status === 200) {
                    alert(`Data ${action === 'save' ? 'saved' : 'submitted'} successfully!`);
                    if (action === 'submit') {
                        setIsSubmitDisabled(true); // once submitted, disable the button
                    }
                } else {
                    alert(`Failed to ${action} data.`);
                }
            } catch (error) {
                console.error(`Error during ${action} operation:`, error);
                alert(`An error occurred while ${action === 'save' ? 'saving' : 'submitting'} the data.`);
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div>
            {loading ? (
                <div className="clt-loading">Loading data...</div>
            ) : (
                <>
                {/* Info */}
                <div style={{ marginBottom: '1rem' }}>
                <strong>Semester:</strong> {semester || 'N/A'} | <strong>Year:</strong> {year || 'N/A'}
                </div>

                {/* Table */}
                <div className="clt-table-container">
                <table {...getTableProps()} className="clt-table">
                <thead className="clt-thead">
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps()} key={column.id} className="clt-th">
                        {column.render("Header")}
                        </th>
                    ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()} className="clt-tbody">
                {rows.length > 0 ? rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()} key={row.id}>
                        {row.cells.map(cell => (
                            <td {...cell.getCellProps()} key={cell.column.id} className="clt-td">
                            {cell.render("Cell")}
                            </td>
                        ))}
                        </tr>
                    );
                }) : (
                    <tr key="no-records">
                    <td colSpan={columns.length} className="clt-no-records">No records found</td>
                    </tr>
                )}
                </tbody>
                </table>
                </div>

                {/* Summary & Buttons Wrapper */}
                <div className="clt-summary-wrapper">
                {/* Buttons - absolutely positioned within clt-summary-wrapper */}
                <div className="clt-buttons-absolute">
                <button
                onClick={() => handleSaveOrSubmit('save')}
                className="clt-button"
                disabled={isSubmitting}
                >
                Save
                </button>

                <button
                onClick={() => handleSaveOrSubmit('submit')}
                className="clt-button clt-submit"
                disabled={isSubmitting || isSubmitDisabled}
                >
                Submit
                </button>
                </div>
                </div>
                {/* Submission Status */}
                <div className="border-box">
                <p><b>{submitted}/{totalPopulation}</b> Evaluated</p>
                </div>

                <div className="summary-cards-wrapper">
                <div className="class-average-summary-card-2">
                <div className="class-pgf-average-column-2">
                <div style={{ fontWeight: '600', marginRight: '25px' }}>
                <ul style={{ margin: '0' }}>
                {programList.map(({ program, count }) => (
                    <li key={program}>
                    <strong>{program}</strong>: {count}
                    </li>
                ))}
                </ul>
                </div>
                <div>No. of Students</div>
                </div>
                <div className="class-proficiency-level-column-2">
                <div><strong>{roundedCompletionRate}%</strong></div>
                <div>Completion Rate</div>
                </div>
                </div>
                <ClassAverageSummary
                course_code={courseCode}
                average={overallPgfAverage}
                studentCount={studentCount}
                studentCountActive={studentCountActive}
                evaluatedCount={evaluatedCount}
                month={month}
                />
                </div>

                </>
            )}
            </div>
        );
};

export default ClassListTable;
