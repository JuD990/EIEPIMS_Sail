import React, { useState, useEffect } from 'react';
import apiService from "@services/apiServices";
import './user-management-buttons.css';

const UserManagementButtons = () => {
  const [csvData, setCsvData] = useState([]);
  const [isCsvUploaded, setIsCsvUploaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    studentId: '',
    email: '',
    department: '',
    program: '',
    yearLevel: '',
  });

  const [departments, setDepartments] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('csv_file', file);

      try {
        const response = await apiService.post('/import-students', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        alert(response.data.message);

        // Refresh the page after a successful upload
        window.location.reload(); // This will refresh the page

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@unc\.edu\.ph$/;
    if (!emailPattern.test(formData.email)) {
      alert("Email must have the domain @unc.edu.ph");
      return; // Prevent form submission
    }

    const payload = {
      studentId: formData.studentId,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      department: formData.department,
      program: formData.program,
      yearLevel: formData.yearLevel,
    };

    try {
      const response = await apiService.post('/store-students', payload);
      alert(`Account added successfully.`);
      handleCloseModal();
      window.location.reload();
    } catch (error) {
      console.error('Error submitting form', error);
      alert('Error adding account');
    }
  };

  useEffect(() => {
    apiService.get("/getDepartmentsOptionsForPOCs").then((response) => {
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

    {/* Display CSV data if uploaded */}
    {isCsvUploaded && (
      <div className="csv-data-preview">
      <h3>Uploaded CSV Data:</h3>
      <pre>{JSON.stringify(csvData, null, 2)}</pre>
      </div>
    )}

    {/* Modal for Add Account */}
    {isModalOpen && (
      <div className="form-modal show">
      <div className="form-container">
      <h2>Add Account</h2>
      <form onSubmit={handleSubmit}>
      <label>First Name</label>
      <input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      required
      />

      <label>Middle Name</label>
      <input
      type="text"
      name="middleName"
      value={formData.middleName}
      onChange={handleChange}
      />

      <label>Last Name</label>
      <input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      required
      />

      <label>Student ID</label>
      <input
      type="text"
      name="studentId"
      value={formData.studentId}
      onChange={handleChange}
      required
      />

      <label>Year Level</label>
      <select
      name="yearLevel"
      value={formData.yearLevel}
      onChange={handleChange}
      required
      >
      <option value="">Select Year Level</option>
      <option value="1st Year">1st Year</option>
      <option value="2nd Year">2nd Year</option>
      <option value="3rd Year">3rd Year</option>
      <option value="4th Year">4th Year</option>
      </select>

      <label>Email</label>
      <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
      pattern="^[a-zA-Z0-9._%+-]+@unc\.edu\.ph$"
      title="Email must be in the format: example@unc.edu.ph"
      />

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

      <label>Program</label>
      <input
      type="text"
      name="program"
      value={formData.program}
      onChange={handleChange}
      required
      />

      <div className="form-buttons">
      <button type="button" className="cancel-button" onClick={handleCloseModal}>
      Cancel
      </button>
      <button type="submit" className="add-button">
      Add
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
