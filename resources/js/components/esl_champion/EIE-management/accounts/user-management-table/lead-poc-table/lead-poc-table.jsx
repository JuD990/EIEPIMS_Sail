import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTable } from "react-table";
import "./lead-poc-table.css";
import UserManagementButtons from "../../user-management-buttons-lead-poc/user-management-button";
import DeleteIcon from "@assets/delete-icon.png";

const UserManagementTable = ({ searchQuery, selectedDepartment }) => {
  const [collegePOCs, setCollegePOCs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    employee_id: "",
    email: "",
    department: "",
    program: "",
  });

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      firstname: "",
      middlename: "",
      lastname: "",
      employee_id: "",
      email: "",
      department: "",
      program: "",
    });
  };

  // Fetch College POCs data
  useEffect(() => {
    const fetchCollegePOCs = async () => {
      try {
        const response = await axios.get("/api/lead-pocs");
        setCollegePOCs(response.data.data);
      } catch (error) {
        console.error("Error fetching College POCs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollegePOCs();
  }, []);

  // Function to reset the password
  const handleResetPassword = async (employeeId) => {
    try {
      const confirmReset = window.confirm(
        "Are you sure you want to reset the password for this College POC?"
      );
      if (!confirmReset) return;

      await axios.put(`/api/lead-poc/${employeeId}/reset-password`);
      alert("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  // Handle modal open with selected row data
  const handleUpdateClick = (collegePOC) => {
    setFormData({
      id: collegePOC.id,
      firstname: collegePOC.firstname,
      middlename: collegePOC.middlename || "",
      lastname: collegePOC.lastname,
      employee_id: collegePOC.employee_id,
      email: collegePOC.email,
      department: collegePOC.department,
      program: collegePOC.program,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `/api/update-lead-poc/${formData.id}`,
        formData
      );
      if (response.status === 200) {
        alert("Lead POC data updated successfully!");
        setShowModal(false);
        window.location.reload();
      } else {
        alert("Failed to update Lead POC data.");
      }
    } catch (error) {
      console.error("Error updating Lead POC data:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollegePOCs = (collegePOCs || []).filter((poc) => {
    const matchesSearch = [poc.firstname, poc.lastname, poc.employee_id, poc.email, poc.department, poc.program]
    .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDepartment = selectedDepartment === "" || poc.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleDeleteLeadPOC = async (employee_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this POC?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/delete-lead-pocs/${employee_id}`);
      setCollegePOCs((prevPOCs) =>
      prevPOCs.filter((poc) => poc.employee_id !== employee_id)
      );
      alert("POC deleted successfully.");
    } catch (error) {
      console.error("Error deleting POC:", error);
      alert("Failed to delete POC.");
    }
  };

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: "No.",
        accessor: (_, index) => index + 1,
      },
      {
        Header: "Name",
        accessor: (row) =>
        `${row.firstname} ${row.middlename ? row.middlename + " " : ""}${row.lastname}`,
      },
      {
        Header: "Employee ID",
        accessor: "employee_id",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Program",
        accessor: "program",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="action-buttons">
          <button
          className="reset-pass-button"
          onClick={() => handleResetPassword(row.original.employee_id)}
          >
          Reset Pass
          </button>
          <button
          className="edit-button"
          onClick={() => handleUpdateClick(row.original)}
          >
          Update
          </button>
          <button
          className="umt-delete-button"
          onClick={() => handleDeleteLeadPOC(row.original.employee_id)}
          title="Delete"
          >
          <img
          src={DeleteIcon}
          alt="Delete"
          style={{ width: "40px", height: "100%" }}
          />
          </button>
          </div>
        ),
      },
    ],
    [collegePOCs]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: filteredCollegePOCs,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
    <div className="table-container">
    <table {...getTableProps()} className="non-sticky-table">
    <thead>
    {headerGroups.map((headerGroup) => (
      <tr {...headerGroup.getHeaderGroupProps()}>
      {headerGroup.headers.map((column) => (
        <th {...column.getHeaderProps()}>{column.render("Header")}</th>
      ))}
      </tr>
    ))}
    </thead>
    <tbody {...getTableBodyProps()}>
    {rows.map((row) => {
      prepareRow(row);
      return (
        <tr {...row.getRowProps()}>
        {row.cells.map((cell) => (
          <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
        ))}
        </tr>
      );
    })}
    </tbody>
    </table>
    </div>

    {/* User Management Buttons Outside and Below the Table */}
    <div className="user-management-container-lead">
    <UserManagementButtons />
    </div>

    {/* Modal */}
    {showModal && (
      <div className="form-modal show" onClick={handleCancel}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
      <h2>Update Credentials</h2>
      <form onSubmit={handleFormSubmit}>
      {["firstname", "middlename", "lastname", "employee_id", "email", "department", "program"].map(
        (field) => (
          <div key={field} style={{ marginBottom: "5px", display: "flex", flexDirection: "column" }}>
          <label style={{ fontWeight: "bold", marginBottom: "5px", textAlign: "left" }}>
          {field.replace("_", " ").toUpperCase()}:
          </label>
          <input
          type="text"
          name={field}
          value={formData[field]}
          onChange={handleInputChange}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
          />
          </div>
        )
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "55px" }}>
      <button
      type="button"
      style={{
        width: "100px",
        height: "40px",
        backgroundColor: "#DE0051",
        color: "#FFFFFF",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
      }}
      onClick={handleCancel}
      >
      Cancel
      </button>
      <button
      type="submit"
      disabled={isSubmitting}
      style={{
        width: "100px",
        height: "40px",
        backgroundColor: isSubmitting ? "#B0B0B0" : "#6B6D76",
        color: "#FFFFFF",
        borderRadius: "12px",
        border: "none",
        cursor: isSubmitting ? "not-allowed" : "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s ease", // Smooth color transition
      }}
      onMouseOver={(e) => {
        if (!isSubmitting) e.target.style.backgroundColor = "#6B6D76"; // Darker blue on hover
      }}
      onMouseOut={(e) => {
        if (!isSubmitting) e.target.style.backgroundColor = "#6B6D76"; // Default color
      }}
      >
      {isSubmitting ? "Updating..." : "Update"}
      </button>
      </div>
      </form>
      </div>
      </div>
    )}
    </div>
  );
};

export default UserManagementTable;
