import React, { useRef, useState } from "react";
import axios from "axios";
import "./UploadImplementingSubjectsButton.css";
import classListLogo from "@assets/Upload.png";

const UploadingButton = () => {
  const classListFileInputRef = useRef(null);
  const [classListLoading, setClassListLoading] = useState(false);
  const [failedImports, setFailedImports] = useState([]);

  const handleClassListButtonClick = () => {
    classListFileInputRef.current.click();
  };

  const handleClassListFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setClassListLoading(true);
    setFailedImports([]); // Clear previous

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/upload-class-list",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message || "Class List uploaded successfully!");

      if (response.data.failedImports && response.data.failedImports.length > 0) {
        setFailedImports(response.data.failedImports);
      } else {
        setFailedImports([]);
      }
    } catch (error) {
      console.error("Error uploading class list:", error.response?.data || error.message);
      alert("Failed to upload class list.");
    } finally {
      setClassListLoading(false);
      event.target.value = ""; // Reset input so same file can be uploaded again
    }
  };

  return (
    <div className="upload-buttons-container">
    <button
    onClick={handleClassListButtonClick}
    className="class-list-subjects-upload-button"
    disabled={classListLoading}
    >
    {classListLoading ? (
      <span>Uploading...</span>
    ) : (
      <>
      <img
      src={classListLogo}
      alt="Class List Icon"
      className="upload-subjects-icon"
      />
      <span className="upload-subjects-label">Class List</span>
      </>
    )}
    </button>

    <input
    type="file"
    accept=".csv, .xlsx, .xls"
    ref={classListFileInputRef}
    onChange={handleClassListFileChange}
    style={{ display: "none" }}
    />

    {/* Display Failed Imports Report */}
    {failedImports.length > 0 && (
      <div className="failed-imports-report" style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', padding: 10, background: '#fff' }}>
      <h3>Failed Imports Report</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
      <tr>
      <th style={{ border: "1px solid #ddd", padding: 8 }}>Student ID</th>
      <th style={{ border: "1px solid #ddd", padding: 8 }}>First Name</th>
      <th style={{ border: "1px solid #ddd", padding: 8 }}>Last Name</th>
      <th style={{ border: "1px solid #ddd", padding: 8 }}>Email</th>
      <th style={{ border: "1px solid #ddd", padding: 8 }}>Reason</th>
      </tr>
      </thead>
      <tbody>
      {failedImports.map((fail, idx) => (
        <tr key={idx}>
        <td style={{ border: "1px solid #ddd", padding: 8 }}>{fail.student_id}</td>
        <td style={{ border: "1px solid #ddd", padding: 8 }}>{fail.firstname}</td>
        <td style={{ border: "1px solid #ddd", padding: 8 }}>{fail.lastname}</td>
        <td style={{ border: "1px solid #ddd", padding: 8 }}>{fail.email}</td>
        <td style={{ border: "1px solid #ddd", padding: 8 }}>{fail.reason}</td>
        </tr>
      ))}
      </tbody>
      </table>
      </div>
    )}
    </div>
  );
};

export default UploadingButton;
