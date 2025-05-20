import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTable } from "react-table";
import "./student-table.css";
import UserManagementButtons from "../../user-management-buttons-students/user-management-button";
import DeleteIcon from "@assets/delete-icon.png";

const UserManagementTable = ({
  searchQuery,
  selectedDepartment,
  selectedUserType,
  selectedProgram,
  selectedYearLevel,
}) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    student_id: '',
    email: '',
    department: '',
    program: '',
    year_level: '',
  });

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      firstname: '',
      middlename: '',
      lastname: '',
      student_id: '',
      email: '',
      department: '',
      program: '',
      year_level: '',
    });
  };

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data.data);
      } catch (error) {
        console.error("Error fetching students:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Function to reset the password
  const handleResetPassword = async (studentId) => {
    try {
      const confirmReset = window.confirm(
        "Are you sure you want to reset the password for this student?"
      );
      if (!confirmReset) return;

      await axios.put(`/api/students/${studentId}/reset-password`);
      alert("Password reset successfully!");

      // Optionally refresh the student list or update the UI
      const updatedStudents = students.map((student) =>
      student.student_id === studentId ? { ...student, password: null } : student
      );
      setStudents(updatedStudents);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    }
  };

  // Handle modal open with selected row data
  const handleUpdateClick = (student) => {
    setFormData({
      id: student.id,
      firstname: student.firstname,
      middlename: student.middlename || "",
      lastname: student.lastname,
      student_id: student.student_id,
      email: student.email,
      department: student.department,
      program: student.program,
      year_level: student.year_level,
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
      const response = await axios.put(`/api/update-students/${formData.id}`, formData);
      if (response.status === 200) {
        setStudents((prevStudents) =>
        prevStudents.map((student) =>
        student.student_id === formData.student_id ? { ...student, ...formData } : student
        )
        );
        setShowModal(false);
      } else {
        alert("Failed to update student data.");
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      alert(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    // Combine first, middle, and last name
    const fullName = `${student.firstname} ${student.middlename ? student.middlename + ' ' : ''}${student.lastname}`;

    // Convert the search query to lowercase for case-insensitive comparison
    const searchQueryLower = searchQuery.toLowerCase();

    // Check if any of the fields match the search query
    const matchesSearch = [
      fullName,    // Full name
      student.student_id,
      student.email,
      student.department,
      student.year_level,
      student.program,
    ].some((field) => field?.toLowerCase().includes(searchQueryLower));

    // Check if student matches selected filters (department, program, year level)
    const matchesDepartment = selectedDepartment
    ? student.department === selectedDepartment
    : true;
    const matchesProgram = selectedProgram
    ? student.program === selectedProgram
    : true;
    const matchesYearLevel = selectedYearLevel
    ? student.year_level === selectedYearLevel
    : true;

    // Return true if all filters and search conditions match
    return matchesSearch && matchesDepartment && matchesProgram && matchesYearLevel;
  });

  const handleDeleteStudent = async (student_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/delete-students/${student_id}`);
      setStudents((prevStudents) =>
      prevStudents.filter((student) => student.student_id !== student_id)
      );
      alert("Student deleted successfully.");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    }
  };

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: "No.",
        accessor: (_row, index) => index + 1,
                                id: "rowNumber",
      },
      {
        Header: "Name",
        accessor: (row) =>
        `${row.firstname} ${row.middlename ? row.middlename + " " : ""}${row.lastname}`,
        id: "fullName",
      },
      {
        Header: "Student ID",
        accessor: "student_id",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Year Level",
        accessor: "year_level",
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
        id: "actions",
        Cell: ({ row }) => (
          <div className="action-buttons">
          <button
          className="reset-pass-button"
          onClick={() => handleResetPassword(row.original.student_id)}
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
          onClick={() => handleDeleteStudent(row.original.student_id)}
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
    [students]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: filteredStudents,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #333333",
  };

  return (
    <div>
    <div className="table-container-student">
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
    <div className="user-management-container">
    <UserManagementButtons department={selectedDepartment} />
    </div>

    {/* Modal */}
    {showModal && (
      <div className={`form-modal ${showModal ? 'show' : ''}`} onClick={handleCancel}>
      <div className="form-container" onClick={(e) => e.stopPropagation()}>
      <h2>Update Credentials</h2>
      <form onSubmit={handleFormSubmit}>
      {[
        { name: "firstname", label: "First Name" },
        { name: "middlename", label: "Middle Name" },
        { name: "lastname", label: "Last Name" },
        { name: "student_id", label: "Student ID" },
        { name: "email", label: "Email" },
        { name: "department", label: "Department" },
        { name: "program", label: "Program" }
      ].map(({ name, label }) => (
        <div key={name} className="form-group">
        <label>{label}:</label>
        <input
        type="text"
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        />
        </div>
      ))}

      {/* Year Level Dropdown */}
      <div className="form-group">
      <label>Year Level:</label>
      <select name="year_level" value={formData.year_level} onChange={handleInputChange}>
      <option value="1st Year">1st Year</option>
      <option value="2nd Year">2nd Year</option>
      <option value="3rd Year">3rd Year</option>
      <option value="4th Year">4th Year</option>
      </select>
      </div>

      {/* Buttons */}
      <div className="button-container">
      <button type="button" className="cancel-button" onClick={handleCancel}>
      Cancel
      </button>
      <button type="submit" className="update-button" disabled={isSubmitting}>
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
