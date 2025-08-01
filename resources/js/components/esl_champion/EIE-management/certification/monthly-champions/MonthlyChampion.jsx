import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import apiService from "@services/apiServices";
import { pdf } from "@react-pdf/renderer";
import Certificate from "./MonthlyCertificate"; // Import the Certificate component
import MonthlyChampionDropdown from "./dropdown/dropdown-monthly-champs";
import "./MonthlyChampion.css";

const MonthlyChampion = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiService.get("/class-lists");

                // Sorting the data from highest to lowest epgf_average
                const sortedData = response.data.sort((a, b) => b.epgf_average - a.epgf_average);
                setData(sortedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const filteredData = data.filter((item) => {
        const fullName = `${item.firstname} ${item.lastname}`.toLowerCase();
        const yearLevel = item.year_level.toString().toLowerCase();
        const program = item.program.toLowerCase();
        const department = item.department.toLowerCase();

        return (
            fullName.includes(searchQuery.toLowerCase()) &&
            (selectedProgram ? program === selectedProgram.toLowerCase() : true) &&
            (selectedYearLevel ? yearLevel === selectedYearLevel.toLowerCase() : true) &&
            (selectedDepartment ? department === selectedDepartment.toLowerCase() : true)
        );
    });

    const handleViewCertificate = async (rowData) => {
        //console.log("🖥️ Selected Row Data:", rowData);

        if (!rowData.class_lists_id) {
            console.error("ERROR: class_lists_id is missing! Check API response.");
            return;
        }

        try {
            const response = await apiService.get(`/certificate/${rowData.class_lists_id}`);

            if (!response.data || Object.keys(response.data).length === 0) {
                console.error("ERROR: Empty API response!");
                return;
            }

            const studentId = response.data.student_id || rowData.student_id || "N/A";

            const certificateData = {
                studentId: studentId,
                name: response.data.name ?? "N/A",
                yearLevel: response.data.year_level ?? "N/A",
                department: response.data.department ?? "N/A",
                fullDepartment: response.data.full_department ?? "N/A",
                deanName: response.data.dean_name ?? "N/A",
                eslChampion: response.data.esl_champion ?? "N/A",
                month: response.data.month ?? "N/A",
                currentYear: response.data.current_year ?? "N/A",
                nextYear: response.data.next_year ?? "N/A",
            };

            //console.log("Certificate Data to be passed:", certificateData);

            // Generate PDF
            const doc = <Certificate {...certificateData} />;
            const pdfBlob = await pdf(doc).toBlob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");

        } catch (error) {
            console.error("❌ Error fetching certificate data:", error);
        }
    };

    const columns = React.useMemo(
        () => [
            { Header: "Name", accessor: (row) => `${row.firstname} ${row.lastname}` },
            { Header: "Year Level", accessor: "year_level" },
            { Header: "Program", accessor: "program" },
            { Header: "Department", accessor: "department" },
            { Header: "EPGF Average", accessor: "epgf_average" },
            {
                Header: "Action",
                accessor: "action",
                Cell: ({ row }) => (
                    <button
                    className="monthly-champion-action-btn"
                    onClick={() => handleViewCertificate(row.original)}
                    >
                    View Certificate
                    </button>
                ),
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data: filteredData,
    });

    return (

        <div>
        <div className="monthly-champion-search-container">
        <MonthlyChampionDropdown
        selectedProgram={selectedProgram}
        setSelectedProgram={setSelectedProgram}
        selectedYearLevel={selectedYearLevel}
        setSelectedYearLevel={setSelectedYearLevel}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        />
        <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className="monthly-champion-search-input"
        />
        </div>

        <div className="monthly-champion-container">
        <div className="monthly-champion-table-container">
        <table {...getTableProps()} className="monthly-champion-table">
        <thead>
        {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id} className="monthly-champion-th">
                {column.render("Header")}
                </th>
            ))}
            </tr>
        ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
            prepareRow(row);
            return (
                <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} key={cell.column.id} className="monthly-champion-td">
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

export default MonthlyChampion;
