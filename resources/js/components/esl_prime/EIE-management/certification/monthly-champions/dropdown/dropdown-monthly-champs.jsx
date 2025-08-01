import React, { useState, useEffect } from "react";
import apiService from "@services/apiServices";
import "./dropdown-monthly-champs.css";
import { FaChevronDown } from "react-icons/fa";

const MonthlyChampsDropdown = ({
    selectedProgram,
    setSelectedProgram,
    selectedYearLevel,
    setSelectedYearLevel,
    selectedDepartment,
    setSelectedDepartment,
}) => {
    const [isProgramOpen, setIsProgramOpen] = useState(false);
    const [isYearLevelOpen, setIsYearLevelOpen] = useState(false);
    const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

    const [programs, setPrograms] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDropdownValue, setSelectedDropdownValue] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiService.get("/implementing-subjects/dropdown");
                if (response.status === 200) {
                    const data = response.data;
                    setPrograms(data.programs || []);
                    setYearLevels(data.year_levels || []);
                    setDepartments(data.departments || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleResetFilters = () => {
        setSelectedProgram("");
        setSelectedYearLevel("");
        setSelectedDepartment("");
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "image/png") {
                alert("Only PNG files are allowed.");
            } else {
                if (!selectedDropdownValue) {
                    alert("Please select a department before uploading.");
                    return;
                }

                const departmentName = selectedDropdownValue.toLowerCase().replace(/\s+/g, "_");
                const renamedFile = new File([file], `${departmentName}.png`, { type: file.type });

                const formData = new FormData();
                formData.append("file", renamedFile);
                formData.append("department", selectedDropdownValue);

                try {
                    const response = await apiService.post("/upload-department-logo", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    });
                    alert("Upload successful!");
                } catch (error) {
                    console.error("Upload error:", error);
                    alert("Upload failed. Please try again.");
                }
            }
        }
    };

    return (
        <div className="esl-monthly-champ-dropdown-container" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Program Dropdown */}
        <div className="esl-monthly-champ-dropdown-wrapper">
        <button className="esl-monthly-champ-dropdown-btn" onClick={() => setIsProgramOpen(prev => !prev)}>
        {selectedProgram || "Select Program"}
        <FaChevronDown className={`esl-monthly-champ-dropdown-arrow ${isProgramOpen ? "open" : ""}`} />
        </button>
        {isProgramOpen && (
            <div className="esl-monthly-champ-dropdown-menu">
            {programs.map((program, index) => (
                <p
                key={index}
                className={`esl-monthly-champ-dropdown-item ${selectedProgram === program ? "esl-monthly-champ-selected" : ""}`}
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

        {/* Year Level Dropdown */}
        <div className="esl-monthly-champ-dropdown-wrapper">
        <button className="esl-monthly-champ-dropdown-btn" onClick={() => setIsYearLevelOpen(prev => !prev)}>
        {selectedYearLevel || "Select Year Level"}
        <FaChevronDown className={`esl-monthly-champ-dropdown-arrow ${isYearLevelOpen ? "open" : ""}`} />
        </button>
        {isYearLevelOpen && (
            <div className="esl-monthly-champ-dropdown-menu">
            {yearLevels.map((level, index) => (
                <p
                key={index}
                className={`esl-monthly-champ-dropdown-item ${selectedYearLevel === level ? "esl-monthly-champ-selected" : ""}`}
                onClick={() => {
                    setSelectedYearLevel(level);
                    setIsYearLevelOpen(false);
                }}
                >
                {level}
                </p>
            ))}
            </div>
        )}
        </div>

        {/* Department Dropdown */}
        <div className="esl-monthly-champ-dropdown-wrapper">
        <button className="esl-monthly-champ-dropdown-btn" onClick={() => setIsDepartmentOpen(prev => !prev)}>
        {selectedDepartment || "Select Department"}
        <FaChevronDown className={`esl-monthly-champ-dropdown-arrow ${isDepartmentOpen ? "open" : ""}`} />
        </button>
        {isDepartmentOpen && (
            <div className="esl-monthly-champ-dropdown-menu">
            {departments.map((department, index) => (
                <p
                key={index}
                className={`esl-monthly-champ-dropdown-item ${selectedDepartment === department ? "esl-monthly-champ-selected" : ""}`}
                onClick={() => {
                    setSelectedDepartment(department);
                    setIsDepartmentOpen(false);
                }}
                >
                {department}
                </p>
            ))}
            </div>
        )}
        </div>

        {/* Reset Filter Link */}
        <a
        href="#"
        onClick={(e) => {
            e.preventDefault();
            handleResetFilters();
        }}
        style={{
            textDecoration: "underline",
            color: "black",
            cursor: "pointer",
            fontSize: "16px",
            whiteSpace: "nowrap",
        }}
        >
        Reset Filter
        </a>

        {/* Upload Button */}
        <button
        onClick={() => setShowUploadModal(true)}
        style={{
            padding: "10px 20px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
        }}
        >
        Upload Deparment Logo
        </button>

        {/* Modal for Upload */}
        {showUploadModal && (
            <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "400px",
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
            }}
            >
            <h3 style={{ marginBottom: "20px" }}>Upload PNG File</h3>

            <div className="monthly-champs-modal-dropdown-wrapper" style={{ position: "relative", marginBottom: "20px" }}>
            <label className="monthly-champs-select-label-modal">
            Select Department
            </label>
            <button
            className="monthly-champs-select-modal"
            onClick={() => setIsDepartmentOpen(prev => !prev)}
            style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center" }}
            >
            {selectedDropdownValue || "Select Department"}
            <FaChevronDown />
            </button>
            {isDepartmentOpen && (
                <div className="monthly-champs-modal-dropdown-menu">
                {departments.map((department, index) => (
                    <p
                    key={index}
                    className={`monthly-champs-modal-dropdown-item ${
                        selectedDropdownValue === department ? "monthly-champs-modal-selected" : ""
                    }`}
                    onClick={() => {
                        setSelectedDropdownValue(department);
                        setIsDepartmentOpen(false);
                    }}
                    >
                    {department}
                    </p>
                ))}
                </div>
            )}
            </div>


            <input
            type="file"
            accept=".png"
            onChange={handleFileUpload}
            style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
                marginBottom: "20px",
            }}
            />

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
            <button
            onClick={() => setShowUploadModal(false)}
            style={{
                padding: "10px 20px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
            }}
            >
            Cancel
            </button>
            </div>
            </div>
        )}
        </div>
    );
};

export default MonthlyChampsDropdown;
