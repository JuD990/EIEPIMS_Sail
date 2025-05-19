import React, { useEffect, useState } from "react";
import axios from "axios";
import "./eie-head-dashboard.css";

const TableComponent = ({ department, schoolYear, semester }) => {
    const firstSem = ["August", "September", "October", "November", "December"];
    const secondSem = ["January", "February", "March", "April", "May"];
    const months = semester === "1st Semester" ? firstSem : secondSem;

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
            const response = await axios.get('/api/dashboard-report', {
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

    const completionRateExpectation = (rate) => {
        return rate === 100 ? "Meets Expectation" : "Below Expectation";
    };

    const exportToCSV = () => {
        let csv = [];
        const headerRow1 = ["Year Level", "Program", "Expected Submissions", "Target", "Course Title"];
        const monthsHeader = months.flatMap(month => [month + " Submitted", month + " Completion Rate", month + " EPGF Avg", month + " SPARK Champion"]);
        csv.push([...headerRow1, ...monthsHeader].join(","));

        Object.keys(tableData).forEach(yearLevel => {
            const yearData = tableData[yearLevel];
            Object.keys(yearData).filter(key => key !== "totals").forEach(courseKey => {
                const row = yearData[courseKey];
                const rowArray = [
                    yearLevel,
                    row.program,
                    row.enrolledStudents,
                    "100%",
                    row.courseTitle,
                    ...months.flatMap(month => {
                        const data = row.monthData[month] || {};
                        return [
                            data.submitted || "-",
                            data.completionRate ? data.completionRate.toFixed(2) + "%" : "-",
                                      data.epgfAverage ? data.epgfAverage.toFixed(2) + (data.proficiencyLevel ? " (" + data.proficiencyLevel + ")" : "") : "-",
                                      data.champion || "-"
                        ];
                    })
                ];
                csv.push(rowArray.join(","));
            });

            // Add year total row
            const totals = yearData.totals;
            const totalRow = [
                `${yearLevel} Total`,
                "",
                totals.expectedSubmissions,
                "100%",
                "",
                ...months.flatMap(month => {
                    return [
                        totals.submitted[month] || "-",
                        totals.completionRate[month] ? totals.completionRate[month].toFixed(2) + "%" : "-",
                                  totals.epgfAverage[month] ? totals.epgfAverage[month].toFixed(2) + (totals.proficiencyLevel[month] ? " (" + totals.proficiencyLevel[month] + ")" : "") : "-",
                                  totals.champion[month] || "-"
                    ];
                })
            ];
            csv.push(totalRow.join(","));
        });

        if (grandTotals) {
            const grandRow = [
                `${department} Total`,
                "",
                grandTotals.expectedSubmissions,
                "100%",
                "",
                ...months.flatMap(month => {
                    return [
                        grandTotals.submitted[month] || "-",
                        grandTotals.completionRate[month] ? grandTotals.completionRate[month].toFixed(2) + "%" : "-",
                                  grandTotals.epgfAverage[month] ? grandTotals.epgfAverage[month].toFixed(2) + (grandTotals.proficiencyLevel[month] ? " (" + grandTotals.proficiencyLevel[month] + ")" : "") : "-",
                                  grandTotals.champion[month] || "-"
                    ];
                })
            ];
            csv.push(grandRow.join(","));
        }

        const blob = new Blob([csv.join("\n")], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `EIE_Dashboard_${department}_${schoolYear}_${semester}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="dashboard-eie-head-container">
        <table className="dashboard-eie-head-table unique-bordered-table">
        <thead>
        <tr>
        <th rowSpan="2">Year Level</th>
        <th rowSpan="2">Program</th>
        <th rowSpan="2">Expected Submissions</th>
        <th rowSpan="2">Target</th>
        <th rowSpan="2">Course Title</th>
        {months.map(month => <th key={month} colSpan="4">{month}</th>)}
        </tr>
        <tr>
        {months.map(month => (
            <React.Fragment key={month}>
            <th>Submitted</th>
            <th>Completion Rate</th>
            <th>EPGF Average</th>
            <th>SPARK Champion</th>
            </React.Fragment>
        ))}
        </tr>
        </thead>
        <tbody>
        {isEmptyData ? (
            <tr>
            <td colSpan={4 + months.length * 4} className="no-data-message">
            No data available
            </td>
            </tr>
        ) : (
            Object.keys(tableData).map(yearLevel => {
                const yearData = tableData[yearLevel];
                const yearTotals = yearData.totals;

                return (
                    <React.Fragment key={yearLevel}>
                    {Object.keys(yearData).filter(key => key !== "totals").map(courseKey => {
                        const row = yearData[courseKey];
                        return (
                            <tr key={courseKey}>
                            <td>{yearLevel}</td>
                            <td>{row.program}</td>
                            <td>{row.enrolledStudents}</td>
                            <td>100%</td>
                            <td>{row.courseTitle}</td>
                            {months.map(month => (
                                <React.Fragment key={month}>
                                <td>{row.monthData[month]?.submitted || '-'}</td>
                                <td>{row.monthData[month]?.completionRate ? row.monthData[month].completionRate.toFixed(2) + '%' : '-'}</td>
                                <td>
                                <div>{row.monthData[month]?.epgfAverage ? row.monthData[month].epgfAverage.toFixed(2) : '-'}</div>
                                <div>{row.monthData[month]?.proficiencyLevel || '-'}</div>
                                </td>
                                <td>{row.monthData[month]?.champion || '-'}</td>
                                </React.Fragment>
                            ))}
                            </tr>
                        );
                    })}

                    {/* Year-Level Totals Row */}
                    <tr className="year-total-row">
                    <td colSpan="2">{yearLevel} Total</td>
                    <td>{yearTotals.expectedSubmissions}</td>
                    <td>100%</td>
                    <td></td>
                    {months.map(month => {
                        const avgCompletionRate =
                        typeof yearTotals.completionRate[month] === 'number' ?
                        yearTotals.completionRate[month].toFixed(2) : '-';
                        const rateExpectation = avgCompletionRate !== '-' ? completionRateExpectation(parseFloat(avgCompletionRate)) : "-";

                        const avgEpgfAverage =
                        typeof yearTotals.epgfAverage[month] === 'number' ?
                        yearTotals.epgfAverage[month].toFixed(2) : '-';

                        return (
                            <React.Fragment key={month}>
                            <td>{yearTotals.submitted[month] || '-'}</td>
                            <td>
                            {avgCompletionRate + '%' || '-'}
                            <br/>
                            {rateExpectation || '-'}
                            </td>
                            <td>
                            {avgEpgfAverage || '-'}
                            <br/>
                            {yearTotals.proficiencyLevel[month] || '-'}
                            </td>
                             <td>{yearTotals.champion[month] || '-'}</td>
                            </React.Fragment>
                        );
                    })}
                    </tr>
                    </React.Fragment>
                );
            })
        )}

            {grandTotals && (
                <tr className="grand-total-row">
                <td colSpan="2">{department} Total</td>
                <td>{grandTotals.expectedSubmissions}</td>
                <td>100%</td>
                <td></td>
                {months.map(month => {
                const submitted = grandTotals.submitted[month] || "-";
                const completionRate = grandTotals.completionRate[month]
                ? grandTotals.completionRate[month].toFixed(2) + '%'
                : "-";
                const rateExpectation = completionRate !== '-'
                ? completionRateExpectation(parseFloat(completionRate))
    : "-";
    const epgfAverage = grandTotals.epgfAverage[month]
    ? grandTotals.epgfAverage[month].toFixed(2)
    : "-";
    const proficiencyLevel = grandTotals.proficiencyLevel[month] || "-";
    const champion = grandTotals.champion[month] || "-";

    return (
        <React.Fragment key={month}>
        <td>{submitted}</td>
        <td>
        {completionRate}
        <br />
        {rateExpectation}
        </td>
        <td>
        {epgfAverage}
        <br />
        {proficiencyLevel}
        </td>
        <td>{champion}</td>
        </React.Fragment>
    );
        })}
        </tr>
    )}

        </tbody>
        </table>
        <button onClick={exportToCSV} className="export-button">
        Export CSV
        </button>
        </div>
    );
};

export default TableComponent;
