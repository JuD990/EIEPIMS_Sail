import React, { useState } from 'react';
import apiService from "@services/apiServices";
import './user-management-buttons.css';

const UserManagementButtons = () => {
  const [csvData, setCsvData] = useState([]);
  const [isCsvUploaded, setIsCsvUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Prevent multiple uploads
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate form submission

  const [formData, setFormData] = useState({
    employee_id: '',
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    department: '',
    full_department: '',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      const response = await apiService.post('/import-head-poc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(response.data.message);
      setCsvData(response.data.data || []);
      setIsCsvUploaded(true);

      // Refresh the page after a successful upload
      window.location.reload();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form fields
    setFormData({
      employee_id: '',
      firstname: '',
      middlename: '',
      lastname: '',
      email: '',
      department: '',
      full_department: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@unc\.edu\.ph$/;
    if (!emailPattern.test(formData.email)) {
      alert('Email must have the domain @unc.edu.ph');
      setIsSubmitting(false);
      return;
    }

    try {
      await apiService.post('/store-head-poc', formData);
      alert('Account added successfully!');
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-management-buttons-container">
    <div className="user-management-buttons">
    {/* Upload CSV Button */}
    <div className="upload-csv-button">
    <input
    type="file"
    id="csv-upload"
    accept=".csv"
    style={{ display: 'none' }}
    onChange={handleFileUpload}
    disabled={isUploading} // Prevent multiple uploads
    />
    <label htmlFor="csv-upload">
    {isUploading ? 'Uploading...' : 'Upload CSV'}
    </label>
    </div>

    {/* Add Account Button */}
    <button className="add-account-button" onClick={handleOpenModal}>
    Add Account
    </button>
    </div>

    {/* Modal */}
    {isModalOpen && (
      <div className="form-modal show">
      <div className="form-container">
      <h2>Add Account</h2>
      <form onSubmit={handleSubmit}>
      {["firstName", "middleName", "lastName", "employeeId", "email", "department", "full_department"].map((field) => (
        <div key={field}>
        <label>{field.replace(/([A-Z])/g, " $1").trim().toUpperCase()}</label>
        <input
        type={field === "email" ? "email" : "text"}
        name={field}
        value={formData[field]}
        onChange={handleChange}
        required={field !== "middleName"}
        pattern={field === "email" ? "^[a-zA-Z0-9._%+\-]+@unc\\.edu\\.ph$" : undefined}
        title={field === "email" ? "Email must be in the format: example@unc.edu.ph" : undefined}
        />
        </div>
      ))}
      <div className="form-buttons">
      <button type="button" className="cancel-button" onClick={handleCloseModal}>
      Cancel
      </button>
      <button type="submit" className="add-button" disabled={isSubmitting}>
      {isSubmitting ? 'Adding...' : 'Add'}
      </button>
      </div>
      </form>
      </div>
      </div>
    )}

    </div>
  );
};

export default UserManagementButtons;
