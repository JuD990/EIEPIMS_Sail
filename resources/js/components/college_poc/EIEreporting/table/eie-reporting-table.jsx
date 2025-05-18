import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TableComponent.css";

const TableComponent = ({ department, schoolYear, semester }) => {
    const [target, setTarget] = useState(100);
    const [tableData, setTableData] = useState({});
    const [grandTotals, setGrandTotals] = useState(null);
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const isEmptyData = Object.keys(tableData).length === 0;

    const firstSemesterMonths = ["August", "September", "October", "November", "December"];
    const secondSemesterMonths = ["January", "February", "March", "April", "May"];
    const months = semester === "1st Semester" ? firstSemesterMonths : secondSemesterMonths;

    useEffect(() => {
        const employeeId = localStorage.getItem("employee_id");  // Retrieve the employee_id from localStorage
        if (department && schoolYear && semester && employeeId) {
            fetchTableData(employeeId);  // Fetch data with employee_id
        }
    }, [department, schoolYear, semester]);

    const fetchTableData = async (employeeId) => {
        try {
            const response = await axios.get('/api/eie-assigned-report', {
                params: { department, semester, schoolYear, employee_id: employeeId }  // Pass employee_id
            });

            if (response.data.success) {
                setTableData(response.data.data);
                setGrandTotals(response.data.grandTotals || null);
            } else {
                setTableData({});
                setGrandTotals(null);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setTableData({});
            setGrandTotals(null);
        }
    };

    const yearLevels = Object.keys(tableData);

    return (
        <div className="eie-reporting-esl-table-container">
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
        <th>Academic Level</th>
        <th>Program</th>
        <th>Expected</th>
        <th>Target</th>
        <th>Assigned Implementing Subjects</th>
        {months.flatMap((month, index) => [
            <th key={`submitted-${month}-${index}`}>Submitted/Participated</th>,
            <th key={`rate-${month}-${index}`}>% Rate</th>,
            <th key={`pgf-avg-${month}-${index}`}>PGF Average</th>,
            <th key={`highest-pgf-${month}-${index}`}>Highest PGF</th>,
            <th key={`winner-pgf-${month}-${index}`}>Winner’s PGF</th>
        ])}
        </tr>
        </thead>
        <tbody className="eie-reporting-esl-table-body-cell">
        {yearLevels
            .filter((yearLevel) => !selectedYearLevel || selectedYearLevel === yearLevel)
            .map((yearLevel) => (
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
                    <td style={{ textAlign: 'left' }}>
                    {programData.courseTitle || "-"}
                    </td>

                    {months.flatMap((month, monthIndex) => {
                        const monthInfo = programData.monthData[month] || {};
                        const completionRate = monthInfo.completionRate;
                        const expectation = completionRate === 100 ? "Meets Expectation" : "Below Expectation";
                        const championEpgfAverage = monthInfo.champion_epgf_average;
                        const championProficiencyLevel = monthInfo.champion_proficiency_level;

                        return [
                            <td key={`submitted-${rowIndex}-${monthIndex}`} style={{ textAlign: 'center' }}>
                            {monthInfo.submitted ?? "-"}
                            </td>,
                            <td key={`rate-${rowIndex}-${monthIndex}`} style={{ textAlign: 'center' }}>
                            {completionRate ? (
                                <>
                                <div>{completionRate}%</div>
                                <div>{expectation}</div>
                                </>
                            ) : "-"}
                            </td>,
                            <td key={`pgf-avg-${rowIndex}-${monthIndex}`} style={{ textAlign: 'center' }}>
                            {monthInfo.epgfAverage ?? "-"}<br />
                            {monthInfo.proficiencyLevel ?? "-"}
                            </td>,
                            <td key={`highest-pgf-${rowIndex}-${monthIndex}`} style={{ textAlign: 'center' }}>
                            {monthInfo.champion ?? "-"}
                            </td>,
                            <td key={`winner-pgf-${rowIndex}-${monthIndex}`} style={{ textAlign: 'center' }}>
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
