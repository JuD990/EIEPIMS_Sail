import React, { useState, useEffect } from 'react';
import apiService from "@services/apiServices";
import './user-management-buttons.css';

const UserManagementButtons = () => {
  const [csvData, setCsvData] = useState([]);
  const [isCsvUploaded, setIsCsvUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    employee_id: '',
    email: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('csv_file', file);

      try {
        const response = await apiService.post('/import-lead-poc', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert(response.data.message);

        // Update state to reflect uploaded data
        setCsvData(response.data.csvData || []);
        setIsCsvUploaded(true);
        window.location.reload();
      } catch (error) {
        console.error('Error uploading CSV:', error);
        alert('Error uploading CSV');
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // ✅ Disable button while submitting

    const emailPattern = /^[a-zA-Z0-9._%+-]+@unc\.edu\.ph$/;
    if (!emailPattern.test(formData.email)) {
      alert("Email must have the domain @unc.edu.ph");
      setIsSubmitting(false); // ✅ Reset submitting state
      return;
    }

    const payload = {
      employee_id: formData.employee_id,
      firstname: formData.firstname,
      middlename: formData.middlename,
      lastname: formData.lastname,
      email: formData.email,
      department: formData.department,
    };

    try {
      await apiService.post('/store-lead-poc', payload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });

      alert(`Account added successfully.`);

      // Refresh the page
      window.location.reload(); // ✅ This refreshes the entire page

    } catch (error) {
      console.error('Error submitting form', error);
      alert('Error adding account');
    } finally {
      setIsSubmitting(false); // ✅ Re-enable button after request completes
    }
  };

  useEffect(() => {
    apiService.get("/getDepartmentsOptionsForPOCs")
    .then((response) => {
      setDepartments(response.data);
    })
    .catch((error) => {
      console.error("Error fetching departments:", error);
    });
  }, []);

  return (
    <div className="user-management-buttons-container">
    <div className="user-management-buttons">

    {/* Upload CSV Button */}
    <div className='upload-csv-button'>
    <input
    type="file"
    id="csv-upload"
    accept=".csv"
    style={{ display: 'none' }}
    onChange={handleFileUpload}
    />
    <label htmlFor="csv-upload">Upload CSV</label>
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
      {["firstname", "middlename", "lastname", "employee_id", "email"].map((field) => (
        <div key={field}>
        <label>{field.replace(/([A-Z])/g, " $1").trim().toUpperCase()}</label>
        <input
        type={field === "email" ? "email" : "text"}
        name={field}
        value={formData[field] || ''} // Ensure the value is never undefined
        onChange={handleChange}
        required={field !== "middlename"}
        />
        </div>
      ))}
      <label>Department</label>
      <select
      name="department"
      value={formData.department}
      onChange={handleChange}
      required
      >
      <option value="">Select Department</option>
      {departments.map((dept, index) => (
        <option key={index} value={dept}>
        {dept}
        </option>
      ))}
      </select>
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
