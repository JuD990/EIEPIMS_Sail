import React, { useState, useEffect } from "react";
import apiService from "@services/apiServices";
import { FaChevronDown } from "react-icons/fa";
import "./master-class-list-dropdown.css";

const MasterClassListDropdown = ({
  selectedProgram,
  setSelectedProgram,
  searchQuery,
  setSearchQuery,
}) => {
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = localStorage.getItem('employee_id');
        const response = await apiService.get(`/master-class-list-department`, {
          params: {
            employee_id: employeeId
          }
        });

        if (response.status === 200) {
          const data = response.data;
          setPrograms(data.programs || []); // You might want to set 'departments' instead of 'programs'
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSelectedProgram("");
    setSearchQuery("");
  };

  return (
    <div className="eie-head-dropdown-container">

    {/* Program Dropdown */}
    <div className="eie-head-dropdown-wrapper">
    <button
    className="eie-head-dropdown-btn"
    onClick={() => setIsProgramOpen((prev) => !prev)}
    >
    {selectedProgram || "Select Program"}
    <FaChevronDown className={`eie-head-dropdown-arrow ${isProgramOpen ? "open" : ""}`} />
    </button>
    {isProgramOpen && (
      <div className="eie-head-dropdown-menu">
      {programs.map((program, index) => (
        <p
        key={index}
        className={`eie-head-dropdown-item ${selectedProgram === program ? "eie-head-selected" : ""}`}
        onClick={() => {
          setSelectedProgram(program);
          setIsProgramOpen(false);
        }}
        >
        {program}
        </p>
      ))}
      </div>
    )}
    </div>

    {/* Reset Filters */}
    <span
    onClick={handleResetFilters}
    style={{
      cursor: 'pointer',
      color: 'black',
      fontSize: '16px',
      marginLeft: '20px',
      alignSelf: 'center',
      textDecoration: 'underline',
    }}
    >
    Reset Filters
    </span>

    {/* Search Input */}
    <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search"
    style={{
      width: '476px',
      height: '60px',
      borderRadius: '8px',
      borderColor: '#333333',
      paddingLeft: '10px',
      fontSize: '16px',
      marginLeft: '710px',
    }}
    />
    </div>
  );
};

export default MasterClassListDropdown;
