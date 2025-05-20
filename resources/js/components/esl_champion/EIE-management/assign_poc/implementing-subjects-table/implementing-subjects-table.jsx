import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";
import "./implementing-subjects-table.css";

const ImplementingSubjectsTable = ({
  searchQuery,
  selectedProgram,
  selectedYearLevel,
  selectedSemester,
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoadingPocs, setIsLoadingPocs] = useState(true);
  const [formData, setFormData] = useState({
    course_code: "",
    employee_id: "",
    assigned_poc: "",
    email: "",
  });
  const [pocs, setPocs] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const employeeId = localStorage.getItem("employee_id");
  const fetchData = async () => {
    const employeeId = localStorage.getItem("employee_id");
    if (!employeeId) {
      setError("Employee ID is required.");
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null); // Reset previous error
    try {
      const response = await axios.get("/api/esl-implementing-subjects", {
        headers: {
          'X-Employee-ID': employeeId,
          'Accept': 'application/json', // Ensure we're sending JSON
        },
      });

      const filteredData = response.data.filter((item) => {
        const matchesSearch = searchQuery
        ? [
          item.course_title,
          item.code,
          item.course_code,
          item.assigned_poc,
          item.program,
          item.semester,
          item.department,
        ]
        .map((field) => field?.toLowerCase() || "")
        .some((field) => field.includes(searchQuery.toLowerCase()))
        : true;

        const matchesProgram = selectedProgram
        ? item.program === selectedProgram
        : true;
        const matchesYear = selectedYearLevel
        ? item.year_level === selectedYearLevel
        : true;
        const matchesSemester = selectedSemester
        ? item.semester === selectedSemester
        : true;

        return matchesSearch && matchesProgram && matchesYear && matchesSemester;
      });

      setData(filteredData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);

      // Log full error response for better debugging
      console.error("Error Response:", error.response?.data);

      setError(error.response?.data?.error || "Failed to fetch data.");
      setData([]); // Prevent crash: ensure empty array
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const fetchFilteredPocs = async () => {
      try {
        const response = await axios.get("/api/filtered-pocs", {
          params: { employee_id: employeeId },
        });
        setPocs(response.data);
      } catch (error) {
        console.error("Error fetching filtered POCs:", error);
        setError("Failed to fetch POCs. Please try again later.");
      } finally {
        setIsLoadingPocs(false);
      }
    };

    fetchFilteredPocs();
  }, [employeeId]);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedProgram, selectedYearLevel, selectedSemester]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUpdate = async (values) => {
    setFormData({
      course_code: values.course_code,
      assigned_poc: values.assigned_poc,
      employee_id: values.employee_id || "",
      email: values.email || "",
    });

    try {
      setIsLoadingPocs(true);
      const response = await axios.get("/api/filtered-pocs-department", {
        params: { department: values.department },
      });
      setPocs(response.data);
    } catch (error) {
      console.error("Error fetching department-specific POCs:", error);
      setError("Failed to fetch POCs for this department.");
    } finally {
      setIsLoadingPocs(false);
      setShowUpdateModal(true);
    }
  };


  const handlePocChange = (e) => {
    const selectedPocId = e.target.value;
    if (!selectedPocId) {
      setFormData({ ...formData, assigned_poc: "", employee_id: "", email: "" });
    } else {
      const selectedPoc = pocs.find((poc) => poc.employee_id === selectedPocId);
      if (selectedPoc) {
        setFormData({
          ...formData,
          assigned_poc: `${selectedPoc.firstname} ${selectedPoc.lastname}`,
          employee_id: selectedPoc.employee_id,
          email: selectedPoc.email,
        });
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await axios.put(
        `/api/update-implementing-subjects/${formData.course_code}`,
        {
          assigned_poc: formData.assigned_poc.trim() || null,
          employee_id: formData.employee_id.trim() || null,
          email: formData.email.trim() || null,
        }
      );
      if (response.status === 200) {
        setShowUpdateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("❌ Error updating assigned POC:", error.response?.data || error);
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
          <button
          className="action-button"
          onClick={() => handleUpdate(row.values)}
          >
          Assign
          </button>
          </div>
        ),
      },
      {
        Header: "Implementing Faculty",
        accessor: "assigned_poc",
        Cell: ({ value }) => value ? value : "Unassigned"
      },
      { Header: "Employee ID", accessor: "employee_id" },
      { Header: "Email", accessor: "email" },
      {
        Header: "Assigned Implementing Subject",
        accessor: "course_title",
        Cell: ({ value }) => (
          <div style={{ textAlign: "left" }}>{value}</div>
        )
      },
      { Header: "Code", accessor: "code" },
      { Header: "Course Code", accessor: "course_code" },
      { Header: "Year Level", accessor: "year_level" },
      { Header: "Semester", accessor: "semester" },
      { Header: "Department", accessor: "department" },
      { Header: "Program", accessor: "program" },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: data || [], // Prevent undefined crash
  });

  return (
    <div>
    {isLoading ? (
      <p>Loading data...</p>
    ) : (
      <div>
      {error && <p style={{ color: "red", marginBottom: "-25px" }}>{error}</p>}
      <div className="table-wrapper-eie-head">
      <table {...getTableProps()} className="data-table">
      <thead className="sticky-header">
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
        {headerGroup.headers.map((column) => (
          <th
          {...column.getHeaderProps()}
          className={column.id === "assigned_poc" ? "sticky-column" : ""}
          >
          {column.render("Header")}
          </th>
        ))}
        </tr>
      ))}
      </thead>
      <tbody {...getTableBodyProps()}>
      {data.length === 0 ? (
        <tr>
        <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px" }}>
        No data available.
        </td>
        </tr>
      ) : (
        rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
            {row.cells.map((cell) => (
              <td
              {...cell.getCellProps()}
              className={cell.column.id === "assigned_poc" ? "sticky-column" : ""}
              >
              {cell.render("Cell")}
              </td>
            ))}
            </tr>
          );
        })
      )}
      </tbody>
      </table>
      </div>
      </div>
    )}

      {/* Show CSV upload errors */}
      {csvErrors.length > 0 && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <h4>CSV Validation Errors:</h4>
          <ul>
            {csvErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showUpdateModal && (
        <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "250px",
          backgroundColor: "#FFFFFF",
          borderRadius: "5px",
          border: "1px solid #333333",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          padding: "20px",
          overflowY: "auto",
          fontFamily: "Poppins",
        }}
        >
        <h2
        style={{
          fontSize: "32px",
          fontFamily: "Epilogue, sans-serif",
          fontWeight: "800",
          color: "#333333",
          marginBottom: "20px",
        }}
        >
        Assigning College POC
        </h2>
        <form onSubmit={handleFormSubmit}>
        {/* Assigned POC Selection */}
        <div style={{ marginBottom: "20px" }}>
        <label
        htmlFor="assignedPoc"
        style={{
          display: "block",
          fontSize: "18px",
          color: "#383838",
          marginBottom: "8px",
          fontWeight: "600",
        }}
        >
        Re-Assign POC:
        </label>
        <select
        id="assignedPoc"
        name="assignedPoc"
        value={formData.employee_id || ""}
        onChange={handlePocChange}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        aria-label="Select Point of Contact"
        >
        <option value="">None</option>
        {pocs.map((poc) => (
          <option key={poc.employee_id} value={poc.employee_id}>
          {poc.firstname} {poc.lastname} ({poc.email})
          </option>
        ))}
        </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
        type="button"
        onClick={() => setShowUpdateModal(false)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#DE0051",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "18px",
          fontFamily: "Poppins",
        }}
        >
        Cancel
        </button>
        <button
        type="submit"
        style={{
          padding: "10px 20px",
          backgroundColor: "#6B6D76",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "18px",
          fontFamily: "Poppins",
        }}
        >
        Assign
        </button>
        </div>
        </form>
        </div>
      )}

    </div>
  );
};

export default ImplementingSubjectsTable;
