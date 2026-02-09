import { useRef, useState } from "react";
import apiService from "@services/apiServices";
import "./UploadImplementingSubjectsButton.css";
import uploadLogo from "@assets/Upload.png";
import questionMark from "@assets/question-mark.png";

const UploadingButton = ({ onArchiveClick }) => {
  const subjectFileInputRef = useRef(null);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Handle button click for uploading subjects
  const handleSubjectButtonClick = () => {
    subjectFileInputRef.current.click();
  };

  // Handle file change for subjects
  const handleSubjectFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSubjectLoading(true);
    const formData = new FormData();
    formData.append("file", file);

try {
      setSubjectLoading(true); // Start loading state
      const response = await apiService.post("/upload-subjects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Log success response
      console.log("Upload Success:", response.data);
      alert("Subject file uploaded successfully!");
      
      window.location.reload(); 
    } catch (error) {
      // 1. Fixed: Log the error specifically
      console.error("Error uploading subject file:", error.response?.data || error.message);
      
      // 2. Access the error response if it exists
      if (error.response) {
         console.log("Server Error Data:", error.response.data);
         console.log("Server Status:", error.response.status);
      }

      alert("Failed to upload subject file.");
    } finally {
      setSubjectLoading(false);
      // Ensure 'event' is passed into your main function
      if (event?.target) {
        event.target.value = ""; 
      }
    }
  }

  // Handle button click for archived subjects (you can replace with actual logic)
  const handleArchivedSubjectsButtonClick = () => {
    if (onArchiveClick) onArchiveClick();
  };

  return (
    <div className="esl-upload-buttons-container">

    <button onClick={handleSubjectButtonClick} className="esl-implementing-subjects-upload-button">
    {subjectLoading ? (
      <span>Uploading...</span>
    ) : (
      <>
      <img src={uploadLogo} alt="Upload Icon" className="upload-icon" />
      <span className="upload-label">Upload Subject</span>
      </>
    )}
    </button>

    <div className="tooltip-container">
    <img
    style={{ width: '30px', height: '30px', marginRight: '60px' }}
    src={questionMark}
    alt="questionMark Icon"
    className="questionMark-icon"
    />
    <span className="tooltip-text">
    <ul className="tooltip-list">
    <li className="tooltip-title">Upload Batch Subjects when:</li>
    <li className="tooltip-sub-title">• Adding a batch of subjects.</li>
    <li className="tooltip-sub-title">• Updating a batch of subjects.</li>
    <li className="tooltip-sub-title">• Removing a batch of subjects.</li>
    </ul>
    </span>
    </div>

    <input
    type="file"
    accept=".csv, .xlsx, .xls"
    ref={subjectFileInputRef}
    onChange={handleSubjectFileChange}
    style={{ display: "none" }}
    />
    </div>
  );
};

export default UploadingButton;
