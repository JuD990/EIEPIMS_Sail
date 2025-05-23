import React, { useEffect, useState } from "react";
import axios from "axios";
import EIEHeadSidebar from '../sidebar/eie-head-sidebar';
import UserInfo from '@user-info/User-info';
import nonSeniorIcon from "@assets/lowLevel.png"; // 1st to 3rd Year
import seniorIcon from "@assets/4thYear.png"; // 4th Year
import "./student-management.css";

const EIEHeadStudentManagement = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    active_students: 0,
    active_percentage: 0,
    graduating_students: 0,
    freshmen: { total: 0, active: 0, active_percentage: 0, subjects: [] },
    sophomores: { total: 0, active: 0, active_percentage: 0, subjects: [] },
    juniors: { total: 0, active: 0, active_percentage: 0, subjects: [] },
    seniors: { total: 0, active: 0, active_percentage: 0, subjects: [] },
  });

  const getCurrentSemester = () => {
    const month = new Date().getMonth() + 1; // getMonth is 0-based
    if (month >= 8 && month <= 12) {
      return '1st Semester';
    } else if (month >= 1 && month <= 5) {
      return '2nd Semester';
    } else {
      return 'Semester Break'; // June & July
    }
  };

  const currentSemester = getCurrentSemester();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const employeeId = localStorage.getItem("employee_id");
        const response = await axios.get(`http://127.0.0.1:8000/api/student-statistics?employee_id=${employeeId}`);
        console.log(response.data);
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch student statistics:", error);
      }
    };

    fetchStats();
  }, []);

const summaryItems = [
  // 🟦 1. OVERALL STATISTICS
  {
    label: "Total Students",
    value: `${stats.total_students}`,
    description: (
      <div className="description-flex">
        <span>Enrolled this semester</span>
      </div>
    ),
  },
  {
    label: "Active Students",
    value: `${stats.active_students}`,
    description: (
      <div className="description-flex">
        <span>Currently Enrolled</span>
      </div>
    ),
  },
  {
    label: "Active Percentage",
    value: `${stats.active_percentage}%`,
    description: (
      <div className="description-flex">
        <span>Overall %</span>
      </div>
    ),
  },
  {
    label: "Graduating Students",
    value: `${stats.graduating_students}`,
    description: (
      <div className="description-flex">
        <span>Eligible for graduation</span>
      </div>
    ),
  },

  // 🟩 2. PER YEAR LEVEL STATISTICS
  {
    label: "Freshmen",
    value: `${stats.freshmen.total}`,
    description: (
      <div className="description-flex">
        <span>Students</span>
        <span>{stats.freshmen.active_percentage}%</span>
      </div>
    ),
    color: "#1B9F24",
    icon: nonSeniorIcon,
    subjects: stats.freshmen.subjects || [],
  },
  {
    label: "Sophomore",
    value: `${stats.sophomores.total}`,
    description: (
      <div className="description-flex">
        <span>Students</span>
        <span>{stats.sophomores.active_percentage}%</span>
      </div>
    ),
    color: "#C7B213",
    icon: nonSeniorIcon,
    subjects: stats.sophomores.subjects || [],
  },
  {
    label: "Junior",
    value: `${stats.juniors.total}`,
    description: (
      <div className="description-flex">
        <span>Students</span>
        <span>{stats.juniors.active_percentage}%</span>
      </div>
    ),
    color: "#2294F2",
    icon: nonSeniorIcon,
    subjects: stats.juniors.subjects || [],
  },
  {
    label: "Senior",
    value: `${stats.seniors.total}`,
    description: (
      <div className="description-flex">
        <span>Students</span>
        <span>{stats.seniors.active_percentage}%</span>
      </div>
    ),
    color: "#D93F3F",
    icon: seniorIcon,
    subjects: stats.seniors.subjects || [],
  },
];

  return (
    <div>
    <EIEHeadSidebar />
    <UserInfo />
    <br /><br /><br /><br />
    <h1 className="student-management-title">Student Management</h1>
    <br /><br /><br />
    <h1 className="student-summary-title">
    Summary of Students - {currentSemester}
    </h1>

    <div className="student-summary-boxes">
    {summaryItems.map((item, index) => {
      const isYearLevel = ["Freshmen", "Sophomore", "Junior", "Senior"].includes(item.label);

      return (
        <div key={index} className={`student-summary-box ${isYearLevel ? 'year-level' : ''}`}>
        <div className="student-summary-label-container">
        <span
        className="student-summary-label"
        style={{
          color: item.color || "inherit",
          textAlign: isYearLevel ? "left" : "center",
          fontWeight: isYearLevel ? "bold" : "normal",
          margin: isYearLevel ? "0" : "auto",
          fontSize: isYearLevel ? "35px" : "",
        }}
        >
        {item.label}
        </span>
        {isYearLevel && (
          <img
          src={item.icon}
          alt={`${item.label} icon`}
          className="student-summary-image"
          />
        )}
        </div>
        <span className={`student-summary-value ${isYearLevel ? 'left-align-value' : ''}`}>
        {item.value}
        </span>
        <span className="student-summary-description">
        {item.description}
        </span>

        {isYearLevel && (
          <div className="subject-list">
          <strong>Implementing Subjects:</strong>
          {item.subjects.length > 0 ? (
            <ul>
            {item.subjects.map((subject, idx) => (
              <li key={idx}>
              {subject.program} — <em>{subject.course_title}</em>
              </li>
            ))}
            </ul>
          ) : (
            <p>No subjects available</p>
          )}
          </div>
        )}
        </div>
      );
    })}
    </div>
    </div>
  );
};

export default EIEHeadStudentManagement;
