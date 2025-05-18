import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import "./EPGFScorecard.css";
import CollegePOCsidebar from "../sidebar/college-poc-sidebar";
import UserInfo from '@user-info/User-info';
import { FaChevronLeft } from 'react-icons/fa';
import Table from "./table/scorecard-table-1";
import Button from './buttons/submit-button';
import ClassAverageSummary from './class-average-summary/class-average-summary';
import axios from 'axios';

const EPGFScorecard = () => {
  const [taskTitle, setTaskTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const [studentCountActive, setStudentCountActive] = useState(0);
  const [classAverage, setClassAverage] = useState(0);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchParams] = useSearchParams();
  const course_code = searchParams.get("course_code");
  const month = searchParams.get("month");

  useEffect(() => {
    if (course_code) {
      axios.all([
        axios.get(`/api/epgf-scorecard?course_code=${course_code}`),
                axios.get(`/api/get-student-count?course_code=${course_code}`),
                axios.get(`/api/get-student-count-active?course_code=${course_code}`),
                axios.get(`/api/get-evaluated-count?course_code=${course_code}`),
                axios.get(`/api/get-class-average?course_code=${course_code}`)
      ])
      .then(axios.spread((courseDetails, studentCountResponse, activeStudentCountResponse, evaluatedCountResponse, classAverageResponse) => {
        if (courseDetails.data.success) {
          setCourseTitle(courseDetails.data.course_title);
        } else {
          console.error('Course not found');
        }

        setStudentCount(studentCountResponse.data.student_count);
        setStudentCountActive(activeStudentCountResponse.data.student_count);
        setEvaluatedCount(evaluatedCountResponse.data.evaluated_count);
        setClassAverage(classAverageResponse.data.average ?? 0);
      }))
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
    }
  }, [course_code]);

  return (
    <div>
    <UserInfo />
    <CollegePOCsidebar />
    <br /><br />

    <Link to="/class-management" style={{ textDecoration: 'none' }}>
    <div className='epgf-scorecard-subject-details'>
    <div className='subject-name-container'>
    <FaChevronLeft className='back-icon' />
    <h1 className='epgf-scorecard-subject-name'>{courseTitle || 'Loading...'}</h1>
    </div>
    <h1 className='epgf-scorecard-subject-code'>{course_code}</h1>
    </div>
    </Link>

    <br /><br />
    <div className="epgf-scorecard-page-title">
    <h1 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '28px' }}>
    Student EIE PGF Scorecard of {month}
    </h1>
    </div>

    <div className='input-container'>
    <div className='input-task-title'>
    <p className='task-label'>Task Title:</p>
    <input
    type="text"
    placeholder="Enter Task Title (Optional)"
    className="custom-input"
    value={taskTitle}
    onChange={(e) => setTaskTitle(e.target.value)}
    />
    </div>
    <div className="search">
    <input
    type="text"
    placeholder="Search Student..."
    className="search-input"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    />
    </div>
    </div>
    <Table
    searchQuery={searchQuery}
    courseCode={course_code}
    taskTitle={taskTitle}
    course_title={courseTitle}
    month={month}
    average={classAverage}
    studentCount={studentCount}
    studentCountActive={studentCountActive}
    evaluatedCount={evaluatedCount}
    />

    <br /><br />
    </div>
  );
};

export default EPGFScorecard;
