import React, { useRef, useState } from "react";
import axios from "axios";
import "./UploadImplementingSubjectsButton.css";
import classListLogo from "@assets/Upload.png";

const UploadingButton = () => {
  const classListFileInputRef = useRef(null);
  const [classListLoading, setClassListLoading] = useState(false);

  const handleClassListButtonClick = () => {
    classListFileInputRef.current.click();
  };

  const handleClassListFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setClassListLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/upload-class-list", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Class List uploaded successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading class list:", error.response?.data || error.message);
      alert("Failed to upload class list.");
    } finally {
      setClassListLoading(false);
      event.target.value = ""; // Clear input
    }
  };

  return (
    <div className="upload-buttons-container">
    <button onClick={handleClassListButtonClick} className="class-list-subjects-upload-button">
    {classListLoading ? (
      <span>Uploading...</span>
    ) : (
      <>
      <img src={classListLogo} alt="Class List Icon" className="upload-subjects-icon" />
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
    </div>
  );
};

export default UploadingButton;
