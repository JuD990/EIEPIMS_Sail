import React, { useState, useEffect } from "react";
import axios from "axios";

const columnToKeyMapping = {
    // Basic Info
    'Name': 'name',
    'Student ID': 'student_id',
    'Date of Interview': 'date_of_interview',
    'Time of Interview': 'time_of_interview',
    'Venue': 'venue',
    'Department': 'department',
    'Program': 'program',
    'Interviewer': 'interviewer',
    'Year Level': 'year_level',

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

    // Remarks
    'PGF Specific Remarks': 'pgf_specific_remarks',
    'School Year Highlight': 'school_year_highlight',
    'School Year Lowlight': 'school_year_lowlight',
    'Reason for Enrolling': 'reason_for_enrolling',
    'After Graduation Plans': 'after_graduation_plans',

    // English Usage Ratings & Explanations
    'Transactions with Employees Rating': 'transactions_with_employees_rating',
    'Transactions with Employees Explanation': 'transactions_with_employees_explanation',
    'Employee-Student Conversations Rating': 'employee_student_conversations_rating',
    'Employee-Student Conversations Explanation': 'employee_student_conversations_explanation',
    'Student-Visitor Conversations Rating': 'student_visitor_conversations_rating',
    'Student-Visitor Conversations Explanation': 'student_visitor_conversations_explanation',
    'Classes Rating': 'classes_rating',
    'Classes Explanation': 'classes_explanation',
    'University Activities Rating': 'university_activities_rating',
    'University Activities Explanation': 'university_activities_explanation',
    'Meetings and Workshops Rating': 'meetings_and_workshops_rating',
    'Meetings and Workshops Explanation': 'meetings_and_workshops_explanation',
    'Written Communications Rating': 'written_communications_rating',
    'Written Communications Explanation': 'written_communications_explanation',
    'Consultation Sessions Rating': 'consultation_sessions_rating',
    'Consultation Sessions Explanation': 'consultation_sessions_explanation',
    'Informal Conversations Rating': 'informal_conversations_rating',
    'Informal Conversations Explanation': 'informal_conversations_explanation',
    'External Representation Rating': 'external_representation_rating',
    'External Representation Explanation': 'external_representation_explanation',
    'Native Language Guidance Rating': 'native_language_guidance_rating',
    'Native Language Guidance Explanation': 'native_language_guidance_explanation',
    'Clarify with Native Language Rating': 'clarify_with_native_language_rating',
    'Clarify with Native Language Explanation': 'clarify_with_native_language_explanation',
    'Help Restate Context Rating': 'help_restate_context_rating',
    'Help Restate Context Explanation': 'help_restate_context_explanation',
    'Immersive Program Rating': 'immersive_program_rating',
    'Immersive Program Explanation': 'immersive_program_explanation',
    'Help Correct English Usage Rating': 'help_correct_english_usage_rating',
    'Help Correct English Usage Explanation': 'help_correct_english_usage_explanation',

    // Optional frontend-only key (if used)
    'Show Status': 'show_status'
};


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
            if (key === 'name') return null; // Skip name
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
            const response = await axios.get('http://localhost:8000/api/reports/fourth-year-diagnostic-report', {
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
            style={{ cursor: 'pointer', color: 'black' }}
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

        {selectedReport && (
            <Modal report={selectedReport} onClose={() => setSelectedReport(null)} />
        )}
        </div>
    );
};

export default Table;
