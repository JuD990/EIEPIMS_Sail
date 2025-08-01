import React, { useState } from 'react';
import apiService from "@services/apiServices";
import './upload-csv-class-list.css';

const UploadClassListButton = () => {
    const [isCsvUploaded, setIsCsvUploaded] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await apiService.post('/import-master-class-list', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                alert(response.data.message);
                setIsCsvUploaded(true);

                // Allow page refresh after a successful upload
                window.location.reload(); // Refresh the page
            } catch (error) {
                alert('Error uploading file: ' + error.response.data.message);
            }
        }
    };

    return (
        <div className="class-list-buttons-container">
        <div className="class-list-buttons">
        <div className="class-list-upload-csv-button">
        <input
        type="file"
        id="csv-upload"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        />
        <label htmlFor="csv-upload">
        Upload CSV
        </label>
        </div>
        </div>
        {isCsvUploaded && <p>CSV file uploaded and processed successfully!</p>}
        </div>
    );
};

export default UploadClassListButton;
