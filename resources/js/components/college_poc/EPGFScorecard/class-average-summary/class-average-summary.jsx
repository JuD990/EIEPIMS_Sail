import React, { useState, useEffect } from "react";
import axios from "axios";
import './class-average-summary.css';

const ClassAverageSummary = ({ course_code, average, studentCount, evaluatedCount, studentCountActive, month }) => {
  const [epgfAverage, setEpgfAverage] = useState(0); // Default to 0

  const epgfProficiencyLevels = [
    { threshold: 0.00, level: 'Beginning', color: 'red' },
    { threshold: 0.50, level: 'Low Acquisition', color: 'red' },
    { threshold: 0.75, level: 'High Acquisition', color: 'red' },
    { threshold: 1.00, level: 'Emerging', color: '#FFCD56' },
    { threshold: 1.25, level: 'Low Developing', color: '#FFCD56' },
    { threshold: 1.50, level: 'High Developing', color: '#FFCD56' },
    { threshold: 1.75, level: 'Low Proficient', color: '#FFCD56' },
    { threshold: 2.00, level: 'Proficient', color: 'green' },
    { threshold: 2.25, level: 'High Proficient', color: 'green' },
    { threshold: 2.50, level: 'Advanced', color: 'green' },
    { threshold: 3.00, level: 'High Advanced', color: '#00008B' },
    { threshold: 4.00, level: 'Native/Bilingual', color: '#00008B' },
  ];

  const getProficiencyLevel = (average) => {
    const sorted = [...epgfProficiencyLevels].sort((a, b) => b.threshold - a.threshold);
    for (let level of sorted) {
      if (average >= level.threshold) {
        return { level: level.level, color: level.color };
      }
    }
    return { level: 'Unknown', color: 'black' };
  };

  const { level, color } = getProficiencyLevel(average);

  // Calculate Completion Rate based on studentCount and evaluatedCount
  const completionRate = studentCount > 0 ? ((evaluatedCount / studentCount) * 100).toFixed(0) : 0;

  // Send data to backend API
  useEffect(() => {
    const sendDataToBackend = async () => {
      try {
        const response = await axios.post('/api/store-class-data-month', {
          course_code,
          completionRate,
          proficiencyLevel: level,
          enrolled_students: studentCount,
          active_students: studentCountActive,
          month: month,
        });

        // Capture epgf_average from response and update state
        if (response.data.success) {
          const fetchedEpgfAverage = response.data.data.epgf_average;
          console.log("Fetched EPGF Average:", fetchedEpgfAverage); // Debugging line
          // Ensure epgfAverage is a valid number
          setEpgfAverage(isNaN(fetchedEpgfAverage) ? 0 : fetchedEpgfAverage);
        }
      } catch (error) {
        console.error("Error sending data to backend:", error.response ? error.response.data : error.message);
      }
    };

    sendDataToBackend();
  }, [course_code, completionRate, level, studentCount, studentCountActive]);

  // Ensure epgfAverage is a valid number
const epgfAverageValue = isNaN(Number(epgfAverage)) ? 0 : Number(epgfAverage);

  // Safely format epgfAverage value with default if it's not valid
  const formattedEpgfAverage = average.toFixed(2);

  return (
    <div style={{ fontWeight: '600' }} className="class-average-summary-card">
      <div className="class-pgf-average-column">
        <div><strong>{formattedEpgfAverage}</strong></div>
        <div>PGF Average</div>
      </div>
      <div className="class-proficiency-level-column">
        <div style={{ color: color }}><strong>{level}</strong></div>
        <div>Proficiency Level</div>
      </div>
    </div>
  );
};

export default ClassAverageSummary;
