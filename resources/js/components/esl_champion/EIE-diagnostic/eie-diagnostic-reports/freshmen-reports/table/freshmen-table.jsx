import React, { useState, useEffect } from "react";
import axios from "axios";
import './freshmen-table.css';

// Mapping column names to data object keys
const columnToKeyMapping = {
    'Name': 'name',
    'Date of Interview': 'date_of_interview',
    'Time of Interview': 'time_of_interview',
    'Venue': 'venue',
    'Department': 'department',
    'Interviewer': 'interviewer',
    // Pronunciation
    'Consistency': 'consistency_descriptor',
    'Consistency Rating': 'consistency_rating',
    'Clarity': 'clarity_descriptor',
    'Clarity Rating': 'clarity_rating',
    'Articulation': 'articulation_descriptor',
    'Articulation Rating': 'articulation_rating',
    'Intonation and Stress': 'intonation_and_stress_descriptor',
    'Intonation and Stress Rating': 'intonation_and_stress_rating',
    'Average in Pronunciation': 'pronunciation_average',

    // Grammar
    'Accuracy': 'accuracy_descriptor',
    'Accuracy Rating': 'accuracy_rating',
    'Clarity of Thought': 'clarity_of_thought_descriptor',
    'Clarity of Thought Rating': 'clarity_of_thought_rating',
    'Syntax': 'syntax_descriptor',
    'Syntax Rating': 'syntax_rating',
    'Average in Grammar': 'grammar_average',

    // Fluency
    'Quality of Response': 'quality_of_response_descriptor',
    'Quality of Response Rating': 'quality_of_response_rating',
    'Detail of Response': 'detail_of_response_descriptor',
    'Detail of Response Rating': 'detail_of_response_rating',
    'Average in Fluency': 'fluency_average',

    'Average PGF Rating': 'average_pgf_rating',

    'PGF Specific Remarks': 'pgf_specific_remarks',
    'School Year Highlight': 'school_year_highlight',
    'School Year Lowlight': 'school_year_lowlight',
    'SPARK Highlight': 'spark_highlight',
    'SPARK Lowlight': 'spark_lowlight',
    'Usage in School/Online (When in School)': 'usage_in_school_online',
    'Usage Offline (Home or Outside)': 'usage_offline',
    'Support Needed': 'support_needed',
    'Show Status': 'show_status'
};

// Modal component
const Modal = ({ onClose, report }) => {
    if (!report) return null;

    return (
        <div
        style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}
        onClick={onClose}
        >
        <div
        style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 5,
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '80%',
            maxWidth: '1600px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
        onClick={e => e.stopPropagation()}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Report Details for {report.name}</h2>
        <button
        onClick={onClose}
        style={{
            backgroundColor: '#007bff',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,123,255,0.5)',
        }}
        >
        Close
        </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
        {Object.entries(columnToKeyMapping).map(([label, key]) => {
            if (key === 'name') return null; // Skip name as it's in header
            return (
                <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ fontWeight: 'bold', padding: '8px 10px', textAlign: 'left', width: '40%', verticalAlign: 'top' }}>
                {label}:
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'left', verticalAlign: 'top' }}>
                {typeof report[key] === 'string' &&
                    !/^\d+(\.\d+)?$/.test(report[key]) && // Not a pure integer or decimal
                    report[key].includes('.')
                    ? (
                        <div style={{ lineHeight: '1.2', margin: 0, padding: 0 }}>
                        {report[key].split('.').map((part, i, arr) => (
                            <React.Fragment key={i}>
                            {part.trim()}
                            {i < arr.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                        </div>
                    ) : report[key]}
                </td>
                </tr>
            );
        })}
        </tbody>
        </table>
        </div>
        </div>
    );
};

const Table = ({ department, attendance, schoolYear, searchQuery }) => {
    const [data, setData] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        if (department && attendance && schoolYear) {
            fetchReports();
        }
    }, [department, attendance, schoolYear]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/reports/first-year-diagnostic-report', {
                params: {
                    department,
                    status: attendance,
                    school_year: schoolYear
                }
            });

            if (Array.isArray(response.data)) {
                setData(response.data);
            } else {
                console.error("Expected an array, but got:", response.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const filteredData = Array.isArray(data) ? data.filter(row => {
        return Object.keys(row).some(key => {
            return row[key] && row[key].toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
    }) : [];

    return (
        <div className="freshmen-table-container">
        <table border="1" cellPadding="10">
        <thead>
        <tr>
        <th className="freshmen-sticky-col freshmen-sticky-header">Name</th>
        <th>Date of Interview</th>
        <th>Time of Interview</th>
        <th>Venue</th>
        <th>Department</th>
        <th>Interviewer</th>
        <th>Show Status</th>
        </tr>
        </thead>
        <tbody>
        {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
            <td
            className="freshmen-sticky-col"
            style={{ cursor: 'pointer', color: 'black' }}  // Removed textDecoration underline
            onClick={() => setSelectedReport(row)}
            title="Click to view details"
            >
            {row.name}
            </td>
            <td>{row.date_of_interview}</td>
            <td>{row.time_of_interview}</td>
            <td>{row.venue}</td>
            <td>{row.department}</td>
            <td>{row.interviewer}</td>
            <td>{row.show_status}</td>
            </tr>
        ))}
        </tbody>
        </table>

        {/* Modal */}
        {selectedReport && <Modal report={selectedReport} onClose={() => setSelectedReport(null)} />}
        </div>
    );
};

export default Table;
