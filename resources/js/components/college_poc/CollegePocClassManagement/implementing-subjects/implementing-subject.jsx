import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import studentnoicon from "@assets/student-no.png";
import axios from "axios";
import "./implementing-subject.css";
import SemestralMonths from "../months-semesters/month-semeseters";

const ImplementingSubjects = ({ semester }) => {
  const [employeeId, setEmployeeId] = useState(null);
  const [userClasses, setUserClasses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeStudentCounts, setActiveStudentCounts] = useState({});
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const course_code = params.get("course_code");
  const [classColors, setClassColors] = useState({});
  let colorIndex = 0; // Color index to keep track of the colors

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employee_id");
    if (!storedEmployeeId) {
      setErrorMessage("Employee ID is not available.");
      setLoading(false);
      return;
    }
    if (!semester) {
      setErrorMessage("Semester is required.");
      setLoading(false);
      return;
    }

    const fetchClassData = async () => {
      setLoading(true); // optionally start loading here to show spinner on semester changes
      try {
        const response = await axios.get(
          `/api/implementing-subject/${storedEmployeeId}?semester=${encodeURIComponent(semester)}`
        );
        if (response.data.success) {
          setUserClasses(response.data.classData);

          // Assign colors sequentially
          const colorsObj = {};
          response.data.classData.forEach((cls) => {
            colorsObj[cls.course_code] = randomColors[colorIndex % randomColors.length];
            colorIndex++; // Increment color index
          });
          setClassColors(colorsObj);

          response.data.classData.forEach((userClass) => {
            fetchActiveStudents(userClass.course_code);
          });

          setErrorMessage(""); // clear error on success
        } else {
          setUserClasses([]);
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        setErrorMessage("No Classes Available");
        setUserClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [semester]);

  const fetchActiveStudents = async (course_code) => {
    try {
      const response = await axios.get(
        `/api/active-students?course_code=${course_code}`
      );
      if (response.data.success) {
        setActiveStudentCounts((prevCounts) => ({
          ...prevCounts,
          [course_code]: response.data.active_student_count,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching active students for course code ${course_code}:`,
        error
      );
    }
  };

  const epgfProficiencyLevels = [
    { threshold: 0.0, level: "Beginning", color: "red" },
    { threshold: 0.5, level: "Low Acquisition", color: "red" },
    { threshold: 0.75, level: "High Acquisition", color: "red" },
    { threshold: 1.0, level: "Emerging", color: "#FFCD56" },
    { threshold: 1.25, level: "Low Developing", color: "#FFCD56" },
    { threshold: 1.5, level: "High Developing", color: "#FFCD56" },
    { threshold: 1.75, level: "Low Proficient", color: "#FFCD56" },
    { threshold: 2.0, level: "Proficient", color: "green" },
    { threshold: 2.25, level: "High Proficient", color: "green" },
    { threshold: 2.5, level: "Advanced", color: "green" },
    { threshold: 3.0, level: "High Advanced", color: "#00008B" },
    { threshold: 4.0, level: "Native/Bilingual", color: "#00008B" },
  ];

  const getProficiencyLevel = (epgfAverage) => {
    const sorted = [...epgfProficiencyLevels].sort(
      (a, b) => b.threshold - a.threshold
    );
    for (let level of sorted) {
      if (epgfAverage >= level.threshold) {
        return { level: level.level, color: level.color };
      }
    }
    return { level: "Unknown", color: "black" };
  };

  const randomColors = [
    "#C0392B", "#27AE60", "#2E86DE", "#B7950B", "#5B2C6F", "#CA6F1E",
    "#148F77", "#A93226", "#AF7A3E", "#1B4F4F", "#C0392B", "#566573",
    "#0077B6", "#9B1D89", "#240046", "#B9770E", "#118C7E",
  ];

  return (
    <div className="example-subjects">
    {loading ? (
      <div>Loading...</div>
    ) : userClasses.length > 0 ? (
      userClasses.map((userClass) => {
        const { level, color } = getProficiencyLevel(userClass.epgf_average);
        return (
          <div key={`${userClass.id}-${userClass.course_code}`}>
          {/* Course Card */}
          <div className="subject-1">
          <div
          className="combined-card"
          style={{ "--course-color": classColors[userClass.course_code] || "#FFA047" }}
          >
          <div className="interior-card"></div>

          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* FLEX CONTAINER */}

          <div className="implementing-subject-1">
          <div className="subject-info">
          <p className="course-title">{userClass.course_title}</p>
          <div className="student-number">
          <img src={studentnoicon} alt="Student Number" />
          <p>{activeStudentCounts[userClass.course_code] || 0}</p>
          </div>
          </div>

          <div className="code-row">
          <p className="course-code">{userClass.code}</p>
          <p className="course-code">{userClass.course_code}</p>
          </div>
          </div>

          {/* 🔻 class-performance moved outside implementing-subject-1 */}
          <div className="class-performance">
          <div className="eie-averages">
          <div className="pgf-average">
          <p>{userClass.epgf_average ? Number(userClass.epgf_average).toFixed(2) : "0.00"}</p>
          <p>EPGF Average</p>
          </div>
          <div className="completion-rate">
          <p>{Number(userClass.completion_rate).toFixed(2).replace(/\.00$/, "")}%</p>
          <p>Completion Rate</p>
          </div>
          <div className="proficiency-level">
          <p style={{ color }}>{level}</p>
          <p>Proficiency Level</p>
          </div>
          </div>
          </div>
          </div>
          </div>
          </div>


          {/* Month-based EPGF and Completion Rate */}
          <div className="scroll-row">
          {Object.entries(userClass.epgf_by_month || {}).map(([monthNumber, epgf]) => {
            const completion = userClass.completion_by_month?.[monthNumber] ?? 0; // Ensure default is 0 if undefined or null
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = monthNames[parseInt(monthNumber, 10) - 1]; // Get the month name from the number

            return (
              <Link
              to={`/epgf-scorecard?month=${monthName}&course_code=${userClass.course_code}`}
              className="month-box"
              key={`${userClass.course_code}-${monthName}`}
              style={{ "--course-color": classColors[userClass.course_code] || "#FFA047" }}
              >
              <h2 style={{ color: "black" }}>Open {monthName} Scorecard</h2>
              <div className="stats-row">
              <div className="stat-box">
              <p>{epgf ? epgf.toFixed(2) : "0.00"}</p>
              <strong>EPGF Average</strong>
              </div>
              <div className="stat-box">
              <p>{completion !== 0 ? `${completion}%` : "0%"}</p>
              <strong>Completion Rate</strong>
              </div>
              </div>
              </Link>
            );
          })}
          </div>
          </div>
        );
      })
    ) : (
      <div className="no-class-available">{errorMessage || "No Classes Available"}</div>
    )}
    </div>
  );
};

export default ImplementingSubjects;
