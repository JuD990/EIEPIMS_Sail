import React from "react";
import ESLSidebar from '../../sidebar/esl-sidebar';
import UserInfo from '@user-info/User-info';
import EPGFrubricVersionDropdown from "./dropdown-button/epgf-rubric-version-dropdown";
import Table from "./table/epgf-rubric-table";
import UploadCSVButton from "./buttons/upload-csv-button";

const EslPrimeEPGFRubricVersion = () => {

  const handleFileUpload = (file, fileType) => {

    const formData = new FormData();
    formData.append("file", file); // Append the file to the form data

    const endpoint = getUploadEndpoint(fileType); // Your backend endpoint

    fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((errorText) => {
          throw new Error(errorText || "Unknown error");
        });
      }
      return response.json();
    })
    .then((data) => {
      showToast(`${fileType} uploaded successfully!`, "success");

      // Refresh the page after successful upload
      window.location.reload();
    })
    .catch((error) => {
      console.error(`Error uploading ${fileType}:`, error);
      showToast(`Error: ${error.message}`, "error");
    });
  };

  // Helper function to get the correct upload endpoint
  const getUploadEndpoint = (fileType) => {
    const uploadEndpoints = {
      pronunciation: "/api/import-pronunciation",
      grammar: "/api/import-grammar",
      fluency: "/api/import-fluency",
    };
    return uploadEndpoints[fileType] || "/api/import";
  };

  // Helper function to show notifications
  const showToast = (message, type) => {
    // You can integrate a toast library here (e.g., react-toastify)
    alert(`${type.toUpperCase()}: ${message}`);
  };

  return (
    <div>
    <ESLSidebar />
    <UserInfo />
    <br/><br/><br/><br/><br/>
    <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '340px', color: '#383838' }}>
    EPGF Rubric Version
    </h1>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '20px' }}>
    <EPGFrubricVersionDropdown />
    <div style={{ marginRight: '35px', marginBottom: '60px' }} >
    <UploadCSVButton
    label="Upload CSV"
    onFileUpload={(file) => handleFileUpload(file, "CSV")}
    />
    </div>
    </div>

    <Table />
    </div>
  );
};

export default EslPrimeEPGFRubricVersion;
