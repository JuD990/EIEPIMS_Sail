import React, { useState, useEffect } from "react";
import { useTable } from "react-table";

const StudentManagementTable = ({
  searchQuery,
  selectedCode,
}) => {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    classListsId: '',  // Add this line to store class_lists_id
    studentId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    classification: '',
    yearLevel: '',
    status: '',
    reason: '',
    courseCode: '',
    gender: '',
    candidate_for_graduating: '',
  });

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employee_id");

    if (!storedEmployeeId) {
      console.error("No employee ID found in localStorage.");
      return;
    }

    fetch(`http://localhost:8000/api/manage-class-list?employee_id=${storedEmployeeId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setStudents(data);
    })
    .catch((error) => console.error("Error fetching data:", error.message));
  }, []);  // This will run only on mount


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      status: value,
      reason: value === "Active" ? "" : prevData.reason
    }));
    setError(""); // Clear error when status changes
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form reload

    const storedEmployeeId = localStorage.getItem("employee_id");

    if (!storedEmployeeId) {
      console.error("No employee ID found in localStorage.");
      return;
    }

    // Validate reason for Shift/Drop
    if ((formData.status === "Dropped") && !formData.reason.trim()) {
      setError("Reason for Shift/Drop is required.");
      return; // Stop form submission
    } else {
      setError(""); // Clear error if input is valid
    }

    const studentId = formData.studentId;

    fetch(`http://localhost:8000/api/update-student-college-poc/${formData.classListsId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${storedEmployeeId}`,
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        classification: formData.classification,
        yearLevel: formData.yearLevel,
        status: formData.status,
        reason: formData.reason,
        gender: formData.gender,
        courseCode: formData.courseCode,
        candidate_for_graduating: formData.candidate_for_graduating,
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return fetch(`http://localhost:8000/api/manage-class-list?employee_id=${storedEmployeeId}`);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setStudents(data);
      setShowModal(false);
    })
    .catch((error) => console.error("Error:", error.message));
  };

  const handleUpdateClick = (row) => {
    setFormData({
      classListsId: row.original.class_lists_id,  // Assign class_lists_id
      firstName: row.original.firstname || '',
      middleName: row.original.middlename || '',
      lastName: row.original.lastname || '',
      classification: row.original.classification || '',
      yearLevel: row.original.year_level || '',
      status: row.original.status || '',
      reason: row.original.reason_for_shift_or_drop || '',
      courseCode: row.original.course_code || '',
      gender: row.original.gender || '',
      candidate_for_graduating: row.original.candidate_for_graduating || '',
    });
    setShowModal(true);
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    if (!student.firstname || !student.lastname) return false; // Ensure names exist

    // Construct full name including middle name (if available)
    const fullName = `${student.firstname} ${student.middlename ? student.middlename + " " : ""}${student.lastname}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

    // Reverse order (Lastname Firstname Middlename) for better search coverage
    const reversedFullName = `${student.lastname} ${student.firstname} ${student.middlename || ""}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

    // Search query formatted
    const query = (searchQuery || "").toLowerCase().trim();

    // Basic search check
    const matchesSearch =
    fullName.includes(query) ||
    reversedFullName.includes(query) ||
    (student.course_code?.toLowerCase() || "").includes(query) ||
    (student.status?.toLowerCase() || "").includes(query) ||
    (student.year_level?.toString() || "").includes(query);

    // Course code and title filters
    const matchesCode = selectedCode ? student.course_code === selectedCode : true;

    return matchesSearch && matchesCode;
  });

  const columns = React.useMemo(
    () => [
      {
        Header: "No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Full Name",
        accessor: (row) => `${row.firstname} ${row.middlename} ${row.lastname}`,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ cell }) => {
          const status = cell.value;
          let statusStyle = {};

          if (status === "Dropped") {
            statusStyle = { color: '#EA0000', fontWeight: 'bold' };
          } else if (status === "Shifted") {
            statusStyle = { color: '#18A0FB', fontWeight: 'bold' };
          }

          return (
            <div style={statusStyle}>
            {status}
            </div>
          );
        },
      },
      {
        Header: "Student ID",
        accessor: "student_id",
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
        Header: "Classification",
        accessor: "classification",
      },
      {
        Header: "Gender",
        accessor: "gender",
      },
      {
        Header: "Course Code",
        accessor: "course_code",
      },
      {
        Header: () => (
          <div style={{ whiteSpace: "nowrap" }}>Reason for Shift/Drop</div>
        ),
        accessor: "reason_for_shift_or_drop",
        Cell: ({ value }) => (
          <span>{value ? `- ${value}` : ""}</span> // Prepend '-' if there is content
        ),
      },
      {
        Header: "Pronunciation",
        accessor: "pronunciation_average",
      },
      {
        Header: "Grammar",
        accessor: "grammar_average",
      },
      {
        Header: "Fluency",
        accessor: "fluency_average",
      },
      {
        Header: "EPGF Average",
        accessor: "epgf_average",
      },
      {
        Header: "Proficiency Level",
        accessor: "proficiency_level",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <button
          style={{
            width: '88px',
            height: '35px',
            borderRadius: '12px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: '15px',
            fontFamily: 'Poppins',
            fontWeight: '600', // SemiBold
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => handleUpdateClick(row)}
          >
          Update
          </button>
        ),
      },
    ],
    []
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: filteredStudents,
  });

  return (
    <>
    <div
    style={{
      overflowY: 'auto',
      height: '650px',
      marginLeft: '350px',
      marginRight: '35px',
      border: '1px solid #ddd',
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
          position: 'relative',
    }}
    >
    <table
    {...getTableProps()}
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      borderSpacing: '0',
      zIndex: 0,
    }}
    >
    <thead>
    {headerGroups.map((headerGroup, headerGroupIndex) => (
      <tr {...headerGroup.getHeaderGroupProps()} style={{ position: 'sticky', top: 0, background: '#F4F7FC', zIndex: 1 }}>
      {headerGroup.headers.map((column, index) => (
        <th
        {...column.getHeaderProps()}
        style={{
          padding: '25px 25px',
          textAlign: 'center',
          borderBottom: 'none',
          fontFamily: 'Poppins',
          fontWeight: '500',
          position: 'sticky',
          top: 0,
          backgroundColor: '#F4F7FC',
          zIndex: 2,
        }}
        >
        {column.render("Header")}
        </th>
      ))}
      </tr>
    ))}
    </thead>
    <tbody {...getTableBodyProps()}>
    {rows.map((row, rowIndex) => {
      prepareRow(row);
      return (
        <tr {...row.getRowProps()}>
        {row.cells.map((cell, cellIndex) => (
          <td
          {...cell.getCellProps()}
          style={{
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            borderLeft: '1px solid #ddd',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '450px',
            fontFamily: 'Poppins',
            fontWeight: '500',
          }}
          >
          {cell.render("Cell")}
          </td>
        ))}
        </tr>
      );
    })}
    </tbody>
    </table>
    </div>

    {showModal && (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '880px',
        backgroundColor: '#FFFFFF',
        borderRadius: '5px',
        border: '1px solid #333333',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
        fontFamily: 'Poppins',
      }}>
      <h2 style={{
        fontSize: '32px',
        fontFamily: 'Epilogue, sans-serif',
        fontWeight: '800',
        color: '#333333',
        marginBottom: '20px',
      }}>
      Update Credentials
      </h2>
      <form>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>First Name:</label>
      <input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      />
      </div>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Middle Name:</label>
      <input
      type="text"
      name="middleName"
      value={formData.middleName}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      />
      </div>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Last Name:</label>
      <input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      />
      </div>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Gender:</label>
      <select
      name="gender"
      value={formData.gender}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      >
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
      </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Classification:</label>
      <select
      name="classification"
      value={formData.classification}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      >
      <option value="Re-Enrollee">Re-Enrollee</option>
      <option value="Transferee">Transferee</option>
      </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Year Level:</label>
      <select
      name="yearLevel"
      value={formData.yearLevel}
      onChange={handleInputChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      >
      <option value="1st Year">1st Year</option>
      <option value="2nd Year">2nd Year</option>
      <option value="3rd Year">3rd Year</option>
      <option value="4th Year">4th Year</option>
      </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '20px', color: '#383838' }}>Status:</label>
      <select
      name="status"
      value={formData.status}
      onChange={handleStatusChange}
      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #333333' }}
      >
      <option value="Active">Active</option>
      <option value="Dropped">Dropped</option>
      </select>
      </div>
      <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "20px", color: "#383838" }}>
      Reason for Dropping:
      </label>
      <textarea
      name="reason"
      value={formData.reason}
      onChange={handleInputChange}
      placeholder="Reason for dropping"
      disabled={formData.status === "Active"}
      style={{
        width: "100%",
        height: "100px",
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #333333",
      }}
      />
      {/* ✅ Show error message if needed */}
      {error && (
        <p style={{ color: "red", marginTop: "5px", fontWeight: "bold" }}>
        {error}
        </p>
      )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
      <button
      type="button"
      onClick={() => setShowModal(false)}
      style={{
        width: '100px',
        height: '40px',
        backgroundColor: '#DE0051',
        color: '#FFFFFF',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
      }}
      >
      Cancel
      </button>
      <button
      type="button"
      onClick={handleSubmit}
      style={{
        width: '100px',
        height: '40px',
        backgroundColor: '#6B6D76',
        color: '#FFFFFF',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
      }}
      >
      Update
      </button>
      </div>
      </form>
      </div>
    )}
    </>
  );
};

export default StudentManagementTable;
