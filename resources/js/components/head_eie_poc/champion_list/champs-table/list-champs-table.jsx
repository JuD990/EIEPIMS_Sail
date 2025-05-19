import React from "react";
import axios from "axios";
import { useTable } from "react-table";
import "./list-champs-table.css";

const ChampListTable = ({
    data = [],
    searchQuery,
    selectedProgram,
    selectedYearLevel,
}) => {
    const handleSelect = async (student) => {
        try {
            const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0–11
            const semester = currentMonth >= 8 && currentMonth <= 12 ? "1st Semester" : "2nd Semester";

            const payload = {
                ...student,
                times_won: 1,
                semester: semester,
            };

            await axios.post("api/store-eie-champions", payload);
            alert(`${student.firstname} ${student.lastname} has been selected as one of the EIE Champions!`);
        } catch (error) {
            console.error("Error saving champion:", error);
            alert("Failed to save champion.");
        }
    };


    const columns = React.useMemo(() => [
        {
            Header: "No.",
            Cell: ({ row }) => row.index + 1,
        },
        {
            Header: "Full Name",
            accessor: row => `${row.firstname ?? ''} ${row.middlename ?? ''} ${row.lastname ?? ''}`,
        },
        { Header: "Student ID", accessor: "student_id" },
        { Header: "Email", accessor: "email" },
        { Header: "Year Level", accessor: "year_level_display" },
        { Header: "Program", accessor: "program" },
        { Header: "Gender", accessor: "gender" },
        {
            Header: "PGF Average",
            accessor: "epgf_average",
            Cell: ({ value }) => (value ? Number(value).toFixed(2) : "-"),
        },
        {
            Header: "Action",
            Cell: ({ row }) => (
                <button
                className="mcl-select-button"
                onClick={() => handleSelect(row.original)}
                disabled={!row.original}
                >
                Select
                </button>
            ),
        },
    ], []);

    const filteredData = data.filter(student => {
        const fullName = `${student.firstname ?? ''} ${student.middlename ?? ''} ${student.lastname ?? ''}`.toLowerCase().trim();
        const search = (searchQuery ?? '').toLowerCase().trim();

        const matchesSearch = fullName.includes(search);
        const matchesProgram = selectedProgram ? student.program === selectedProgram : true;
        const matchesYearLevel = selectedYearLevel ? student.year_level === selectedYearLevel : true;

        return matchesSearch && matchesProgram && matchesYearLevel;
    });

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: filteredData });

    return (
        <div className="mcl-table-container">
        <table {...getTableProps()} className="mcl-table">
        <thead>
        {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} key={column.id}>
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
                <tr {...row.getRowProps()} key={row.id || i}>
                {row.cells.map((cell, j) => (
                    <td {...cell.getCellProps()} key={cell.column.id || j}>
                    {cell.render("Cell")}
                    </td>
                ))}
                </tr>
            );
        })}
        </tbody>
        </table>
        </div>
    );
};

export default ChampListTable;
