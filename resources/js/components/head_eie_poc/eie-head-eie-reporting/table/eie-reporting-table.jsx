import React, { useState, useEffect } from "react";
import "./TableComponent.css"; // Import the CSS file
import axios from "axios";

const TableComponent = ({ department, schoolYear, semester }) => {
    const [target, setTarget] = useState(100);

    // Determine the months based on the selected semester
    const firstSemesterMonths = ["August", "September", "October", "November", "December"];
    const secondSemesterMonths = ["January", "February", "March", "April", "May"];
    const months = semester === "1st Semester" ? firstSemesterMonths : secondSemesterMonths;

    const [tableData, setTableData] = useState({});
    const [grandTotals, setGrandTotals] = useState(null);
    const isEmptyData = Object.keys(tableData).length === 0;

    useEffect(() => {
        if (department && schoolYear && semester) {
            fetchTableData();
        }
    }, [department, schoolYear, semester]);

    const fetchTableData = async () => {
        try {
            const response = await axios.get('/api/eie-report', {
                params: { department, semester, schoolYear }
            });

            if (response.data.success) {
                setTableData(response.data.data);
                setGrandTotals(response.data.grandTotals);
            } else {
                setTableData({});
                setGrandTotals(null);
            }
        } catch (error) {
            setTableData({});
            setGrandTotals(null);
        }
    };

    const data = [
        { yearLevel: "1st Year", rows: Array(4).fill({ program: "", expected: "", target: `${target}%`, implementingSubject: "", faculty: "" }) },
        { yearLevel: "2nd Year", rows: Array(4).fill({ program: "", expected: "", target: `${target}%`, implementingSubject: "", faculty: "" }) },
        { yearLevel: "3rd Year", rows: Array(4).fill({ program: "", expected: "", target: `${target}%`, implementingSubject: "", faculty: "" }) },
        { yearLevel: "4th Year", rows: Array(4).fill({ program: "", expected: "", target: `${target}%`, implementingSubject: "", faculty: "" }) }
    ];

    return (
        <div className="eie-reporting-esl-table-container-2">
        <table className="eie-reporting-esl-table-poc-table">
        <thead>
        <tr className="eie-reporting-esl-table-header-colored">
        <th colSpan="6" className="eie-reporting-college-poc-table-header-cell"></th>
        {months.map((month, index) => (
            <th key={index} colSpan="5" className="eie-reporting-college-poc-table-header-cell" style={{ textAlign: "center" }}>
            {month}
            </th>
        ))}
        </tr>
        <tr className="eie-reporting-esl-table-header-plain">
        <th>Year Level</th>
        <th>Program</th>
        <th>Expected</th>
        <th>Target</th>
        <th>Implementing Subjects</th>
        <th>Faculty</th>
        {months.flatMap((month, index) => [
            <th key={`submitted-${month}-${index}`} className="eie-reporting-esl-table-header-header-cell">Submitted/Participated</th>,
            <th key={`rate-${month}-${index}`} className="eie-reporting-esl-table-header-header-cell">% Rate</th>,
            <th key={`pgf-avg-${month}-${index}`} className="eie-reporting-esl-table-header-header-cell">PGF Average</th>,
            <th key={`highest-pgf-${month}-${index}`} className="eie-reporting-esl-table-header-header-cell">Highest PGF</th>,
            <th key={`winner-pgf-${month}-${index}`} className="eie-reporting-esl-table-header-header-cell">Winner’s PGF</th>
        ])}
        </tr>
        </thead>
        <tbody className="eie-reporting-esl-table-body-cell">
        {Object.keys(tableData).map((yearLevel) => (
            <React.Fragment key={yearLevel}>
            <tr className="eie-reporting-esl-table-body-cell">
            <td style={{ textAlign: 'left' }} colSpan={6}><strong>{yearLevel}</strong></td>
            </tr>
            {Object.values(tableData[yearLevel]).map((programData, rowIndex) => (
                <tr key={rowIndex}>
                <td></td>
                <td style={{ textAlign: 'center' }}>{programData.program || "-"}</td>
                <td style={{ textAlign: 'center' }}>{programData.enrolledStudents || "-"}</td>
                <td style={{ textAlign: 'center' }}>{`${target}%`}</td>
                <td style={{ textAlign: 'left' }}>{programData.courseTitle || "-"}</td>
                <td style={{ textAlign: 'center' }}>{programData.assignedPOC || "-"}</td>

                {months.flatMap((month, monthIndex) => {
                    const monthInfo = programData.monthData[month] || {};
                    const completionRate = monthInfo.completionRate;
                    const expectation = completionRate === 100 ? "Meets Expectation" : "Below Expectation";
                    const championEpgfAverage = monthInfo.champion_epgf_average;
                    const championProficiencyLevel = monthInfo.champion_proficiency_level;

                    return [
                        <td style={{ textAlign: 'center' }} key={`submitted-${rowIndex}-${monthIndex}`}>
                        {monthInfo.submitted || "-"}
                        </td>,
                        <td style={{ textAlign: 'center' }} key={`rate-${rowIndex}-${monthIndex}`}>
                        {completionRate ? (
                            <>
                            <div>{completionRate}%</div>
                            <div>{expectation}</div>
                            </>
                        ) : "-"}
                        </td>,
                        <td style={{ textAlign: 'center' }} key={`pgf-avg-${rowIndex}-${monthIndex}`}>
                        {monthInfo.epgfAverage || "-"} <br/>
                        {monthInfo.proficiencyLevel || "-"}
                        </td>,
                        <td style={{ textAlign: 'center' }} key={`highest-pgf-${rowIndex}-${monthIndex}`}>
                        {monthInfo.champion || "-"}
                        </td>,
                        <td style={{ textAlign: 'center' }} key={`winner-pgf-${rowIndex}-${monthIndex}`}>
                        {championEpgfAverage ? (
                            <>
                            <div>{championEpgfAverage}</div>
                            <div>{championProficiencyLevel || "-"}</div>
                            </>
                        ) : "-"}
                        </td>
                    ];
                })}
                </tr>
            ))}
            </React.Fragment>
        ))}
        </tbody>

        </table>
        </div>
    );
};

export default TableComponent;
