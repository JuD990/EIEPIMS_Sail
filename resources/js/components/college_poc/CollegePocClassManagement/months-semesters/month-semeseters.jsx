import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './month-semesters.css';

const data = {
  '1st Semester': [
    { month: 'August', epgf: 3.2, completion: 80 },
    { month: 'September', epgf: 3.4, completion: 85 },
    { month: 'October', epgf: 3.1, completion: 78 },
    { month: 'November', epgf: 3.5, completion: 88 },
    { month: 'December', epgf: 3.3, completion: 82 },
  ],
  '2nd Semester': [
    { month: 'January', epgf: 3.6, completion: 90 },
    { month: 'February', epgf: 3.7, completion: 92 },
    { month: 'March', epgf: 3.5, completion: 89 },
    { month: 'April', epgf: 3.4, completion: 87 },
    { month: 'May', epgf: 3.6, completion: 91 },
  ],
};

const SemestralStats = () => {
  const [semester, setSemester] = useState('1st Semester');

  const handleChange = (e) => {
    setSemester(e.target.value);
  };

  return (
    <div className="semestral-wrapper">
    <div className="header">
    <h1 className="title">Class Record</h1>
    <select className="dropdown" value={semester} onChange={handleChange}>
    <option value="1st Semester">1st Semester</option>
    <option value="2nd Semester">2nd Semester</option>
    </select>
    </div>

    <div className="scroll-row">
    {data[semester].map(({ month, epgf, completion }) => (
      <Link to={`/monthly-scorecard?month=${month}`} className="month-box" key={month}>
      <h2>{month}</h2>
      <div className="stats-row">
      <div className="stat-box">
      <p>{epgf}</p>
      <strong>EPGF Average</strong>
      </div>
      <div className="stat-box">
      <p>{completion}%</p>
      <strong>Completion Rate</strong>
      </div>
      </div>
      </Link>
    ))}
    </div>
    </div>
  );
};

export default SemestralStats;
