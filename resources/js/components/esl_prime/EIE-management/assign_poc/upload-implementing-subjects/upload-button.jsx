import React, { useRef, useState } from "react";
import apiService from "@services/apiServices";
import "./UploadImplementingSubjectsButton.css";
import classListLogo from "@assets/Upload.png";

const UploadingButton = () => {
  const classListFileInputRef = useRef(null);
  const [classListLoading, setClassListLoading] = useState(false);

  // Handle button click for uploading class list
  const handleClassListButtonClick = () => {
    classListFileInputRef.current.click();
  };

  // Handle file change for class list
  const handleClassListFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setClassListLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiService.post("/upload-class-list", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Class List uploaded successfully!");
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error("Error uploading class list:", error.response?.data || error.message);
      alert("Failed to upload class list.");
    } finally {
      setClassListLoading(false);
      event.target.value = ""; // Clear the file input after upload
    }
  };

  return (
    <div className="upload-buttons-container">
    {/* Upload Class List Button */}
    <button onClick={handleClassListButtonClick} className="class-list-upload-button">
    {classListLoading ? (
      <span>Uploading...</span>
    ) : (
      <>
      <img src={classListLogo} alt="Class List Icon" className="upload-icon" />
      <span className="upload-label">Upload Class List</span>
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
