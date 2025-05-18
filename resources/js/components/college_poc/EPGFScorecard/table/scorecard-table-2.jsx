import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TableComponent.css';
import SubmitButton from '../buttons/submit-button';

const TableComponent = ({ course_code, taskTitle, department, course_title, searchQuery }) => {
  const [courseTitle, setCourseTitle] = useState(null);
  const [version, setVersion] = useState(null);
  const [students, setStudents] = useState([]); // State to store students
  const [loading, setLoading] = useState(true); // Loading state
  const [consistencyOptions, setConsistencyOptions] = useState([]); // Options for consistency dropdown
  const [clarityOptions, setClarityOptions] = useState([]);
  const [articulationOptions, setArticulationOptions] = useState([]);
  const [intonationAndStressOptions, setIntonationAndStressOptions] = useState([]);
  const [accuracyOptions, setAccuracyOptions] = useState([]);
  const [clarityofthoughtOptions, setClarityOfThoughtOptions] = useState([]);
  const [syntaxOptions, setSyntaxOptions] = useState([]);
  const [qualityOfResponseOptions, setQualityOfResponseOptions] = useState([]);
  const [detailOfResponseOptions, setDetailOfResponseOptions] = useState([]);
  const [submittedRows, setSubmittedRows] = useState({});
  const [submittedIds, setSubmittedIds] = useState([]);

  useEffect(() => {
    const savedStates = localStorage.getItem('submittedRows');
    if (savedStates) {
      setSubmittedRows(JSON.parse(savedStates));
    }
  }, []);

  // Save button states to localStorage when they change
  useEffect(() => {
    localStorage.setItem('submittedRows', JSON.stringify(submittedRows));
  }, [submittedRows]);

  // Fetch students based on `course_code`, "Active" status and department
  // fetch class list by "Active" status and department
  useEffect(() => {
    if (course_code) {
      axios
      .get(`/api/epgf-scorecard/students?course_code=${course_code}`)
      .then((response) => {
        if (response.data.success) {
          setStudents(response.data.students); // Set the fetched students data
        } else {
          console.error('No active students found');
        }
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [course_code]);

  // Fetch consistency options based on version
  useEffect(() => {
    const fetchConsistencyOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/consistency/${version}`);
          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredConsistency = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setConsistencyOptions(filteredConsistency);
          } else {
            console.error("No pronunciations found in the response");
          }
        } catch (error) {
          console.error("Error fetching consistency options:", error);
        }
      }
    };

    fetchConsistencyOptions();
  }, [version]);

  useEffect(() => {
    const fetchClarityOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/clarity/${version}`);

          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredClarity = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setClarityOptions(filteredClarity);
          } else {
            console.error("No clarity options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching clarity options:", error);
        }
      }
    };

    fetchClarityOptions();
  }, [version]);

  useEffect(() => {
    const fetchArticulationOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/articulation/${version}`);

          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredArticulation = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setArticulationOptions(filteredArticulation);
          } else {
            console.error("No articulation options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching articulation options:", error);
        }
      }
    };

    fetchArticulationOptions();
  }, [version]);

  useEffect(() => {
    const fetchIntonationAndStressOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/intonationStress/${version}`);

          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredIntonationAndStress = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setIntonationAndStressOptions(filteredIntonationAndStress);

          } else {
            console.error("No Intonation and Stress options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Intonation and Stress options:", error);
        }
      }
    };

    fetchIntonationAndStressOptions();
  }, [version]);

  useEffect(() => {
    const fetchAccuracyOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/accuracy/${version}`);

          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredAccuracy = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setAccuracyOptions(filteredAccuracy);

          } else {
            console.error("No Accuracy options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Accuracy options:", error);
        }
      }
    };

    fetchAccuracyOptions();
  }, [version]);

  useEffect(() => {
    const fetchClarityOfThoughtOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/clarityOfThought/${version}`);
          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredClarityOfThought = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setClarityOfThoughtOptions(filteredClarityOfThought);
          } else {
            console.error("No Clarity Of Thought options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Clarity Of Thoughtoptions:", error);
        }
      }
    };

    fetchClarityOfThoughtOptions();
  }, [version]);

  useEffect(() => {
    const fetchSyntaxOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/syntax/${version}`);
          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredSyntax = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setSyntaxOptions(filteredSyntax);
          } else {
            console.error("No Syntax options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Syntax options:", error);
        }
      }
    };

    fetchSyntaxOptions();
  }, [version]);

  useEffect(() => {
    const fetchQualityOfResponseOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/qualityOfResponse/${version}`);
          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredQualityOfResponse = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setQualityOfResponseOptions(filteredQualityOfResponse);
          } else {
            console.error("No Quality Of Response options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Quality Of Response options:", error);
        }
      }
    };

    fetchQualityOfResponseOptions();
  }, [version]);


  useEffect(() => {
    const fetchDetailOfResponseOptions = async () => {
      if (version) {
        try {
          const response = await axios.get(`/api/detailOfResponse/${version}`);
          if (response.status === 200 && Array.isArray(response.data)) {
            const filteredDetailOfResponse = response.data.map(item => ({
              id: item.id,
              pronunciation: item.pronunciation,
              rating: item.rating,
              descriptor: item.descriptor,
            }));
            setDetailOfResponseOptions(filteredDetailOfResponse);
          } else {
            console.error("No Detail Of Response options found or response data is not an array");
          }
        } catch (error) {
          console.error("Error fetching Detail Of Response options:", error);
        }
      }
    };

    fetchDetailOfResponseOptions();
  }, [version]);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await axios.get('/api/rubric/active-version');
        const versionString = response.data.version;

        if (!versionString) {
          console.error("No version found in the response", response.data);
          return;
        }
        // Extract the major version using regex
        const versionMatch = versionString.match(/^v(\d+)/);
        if (versionMatch) {
          const majorVersion = versionMatch[1]; // The major version will be in the first capture group
          setVersion(majorVersion);  // Set the major version to state
        } else {
          console.error("Version string doesn't match the expected format:", versionString);
        }
      } catch (error) {
        console.error("Error fetching version:", error);
      }
    };

    fetchVersion();
  }, []); // Run this effect only once when the component mounts

  useEffect(() => {
    const fetchSubmittedIds = async () => {
      try {
        const response = await fetch('/api/submitted-scorecards');
        const data = await response.json();
        console.log(data);
        setSubmittedIds(data); // Array of student IDs who already submitted
      } catch (error) {
        console.error('Error fetching submitted student IDs:', error);
      }
    };

    fetchSubmittedIds();
  }, []);

  const columns = [
    'No',
    'Full Name',
    'Student ID',
    'Year Level',
    'Program',
    'PGF Average',
    'Proficiency',
    'Type',
    'Consistency',
    '',
    'Clarity',
    '',
    'Articulation',
    '',
    'Intonation and Stress',
    '',
    'Pronunciation',
    'Accuracy',
    '',
    'Clarity of Thought',
    '',
    'Syntax',
    '',
    'Grammar',
    'Quality Of Response',
    '',
    'Detail Of Response',
    '',
    'Fluency',
    'Comment',
    'Actions',
  ];

  const updateData = (rowIndex, columnId, newValue) => {
    const updatedStudents = [...students];
    updatedStudents[rowIndex][columnId] = newValue;
    setStudents(updatedStudents);
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  // Create a lookup for consistency options for faster access
  const consistencyLookup = consistencyOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const clarityLookup = clarityOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const articulationLookup = articulationOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const intonationAndStressLookup = intonationAndStressOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const accuracyLookup = accuracyOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const clarityofthoughtLookup = clarityofthoughtOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const syntaxLookup = syntaxOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const qualityOfResponseLookup = qualityOfResponseOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const detailOfResponseLookup = detailOfResponseOptions.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {});

  const filteredStudents = students.filter(student =>
  `${student.firstname} ${student.lastname}`
  .toLowerCase()
  .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="epgf-scorecard-table-container">
    <table className="epgf-scorecard-table">
    <thead>
    <tr>
    {columns.map((column, index) => (
      <th key={index}>{column}</th>
    ))}
    </tr>
    </thead>
    <tbody>
    {filteredStudents.map((student, rowIndex) => {

      {/* Pronunciation */}
      const consistencySelectedOption = consistencyOptions?.find(option => option.id === student.consistency);
      const consistencyRating = consistencySelectedOption ? parseFloat((consistencySelectedOption.rating || '0.00').replace(',', '.')) : 0;

      const claritySelectedOption = clarityOptions?.find(option => option.id === student.clarity);
      const clarityRating = claritySelectedOption ? parseFloat((claritySelectedOption.rating || '0.00').replace(',', '.')) : 0;

      const articulationSelectedOption = articulationOptions?.find(option => option.id === student.articulation);
      const articulationRating = articulationSelectedOption ? parseFloat((articulationSelectedOption.rating || '0.00').replace(',', '.')) : 0;

      const intonationAndStressSelectedOption = intonationAndStressOptions?.find(option => option.id === student.intonation_and_stress);
      const intonationAndStressRating = intonationAndStressSelectedOption ? parseFloat((intonationAndStressSelectedOption.rating || '0.00').replace(',', '.')) : 0;

      const pronunciationAverage = (consistencyRating + clarityRating + articulationRating + intonationAndStressRating) / 4;

      {/* Grammar */}
      // Finding selected options
      const accuracySelectedOption = accuracyOptions?.find(option => option.id === student.accuracy);
      const clarityofthoughtSelectedOption = clarityofthoughtOptions?.find(option => option.id === student.clarity_of_thought);
      const syntaxSelectedOption = syntaxOptions?.find(option => option.id === student.syntax);

      // Parsing ratings
      const accuracyRating = accuracySelectedOption ? parseFloat((accuracySelectedOption.rating || '0.00').replace(',', '.')) : 0;
      const clarityofthoughtRating = clarityofthoughtSelectedOption ? parseFloat((clarityofthoughtSelectedOption.rating || '0.00').replace(',', '.')) : 0;
      const syntaxRating = syntaxSelectedOption ? parseFloat((syntaxSelectedOption.rating || '0.00').replace(',', '.')) : 0;

      // Calculating grammar average
      const grammarAverage = (accuracyRating + clarityofthoughtRating + syntaxRating) / 3;

      {/* Fluency */}
      const qualityOfResponseSelectedOption = qualityOfResponseOptions?.find(option => option.id === student.quality_of_response);
      const detailOfResponseSelectedOption = detailOfResponseOptions?.find(option => option.id === student.detail_of_response);

      const qualityOfResponseRating = qualityOfResponseSelectedOption ? parseFloat((qualityOfResponseSelectedOption.rating || '0.00').replace(',', '.')) : 0;
      const detailOfResponseRating = detailOfResponseSelectedOption ? parseFloat((detailOfResponseSelectedOption.rating || '0.00').replace(',', '.')) : 0;

      const fluencyAverage = (qualityOfResponseRating + detailOfResponseRating) / 2;

      const epgfAverage = (pronunciationAverage + grammarAverage + fluencyAverage) / 3;

      const epgfProficiencyLevels = [
        { threshold: 0.0, level: 'Beginning', color: '#E23F44' },
        { threshold: 0.5, level: 'Low Acquisition', color: '#E23F44' },
        { threshold: 0.75, level: 'High Acquisition', color: '#E23F44' },
        { threshold: 1.0, level: 'Emerging', color: '#FFCD56' },
        { threshold: 1.25, level: 'Low Developing', color: '#FFCD56' },
        { threshold: 1.5, level: 'High Developing', color: '#FFCD56' },
        { threshold: 1.75, level: 'Low Proficient', color: '#FFCD56' },
        { threshold: 2.0, level: 'Proficient', color: 'green' },
        { threshold: 2.25, level: 'High Proficient', color: 'green' },
        { threshold: 2.5, level: 'Advanced', color: 'green' },
        { threshold: 3.0, level: 'High Advanced', color: '#00008B' },
        { threshold: 4.0, level: 'Native/Bilingual', color: '#00008B' },
      ];

      const getProficiencyLevel = (epgfAverage) => {
        const sorted = [...epgfProficiencyLevels].sort((a, b) => b.threshold - a.threshold);
        for (let level of sorted) {
          if (epgfAverage >= level.threshold) {
            return { level: level.level, color: level.color };
          }
        }
        return { level: 'Unknown', color: 'black' };
      };

      const checkStudentSubmission = async (student_id) => {
        try {
          const response = await fetch(`/api/check-scorecard-submission/${student_id}`);
          const data = await response.json();
          return data.exists;
        } catch (error) {
          console.error('Error checking submission:', error);
          return false; // Default to false if there's an error
        }
      };

      const handleRowSubmit = async (rowIndex) => {
        const student = students[rowIndex];

        // Retrieve the student's attribute IDs (for example, consistency, clarity, etc.)
        const consistencyId = student.consistency;
        const clarityId = student.clarity;
        const articulationId = student.articulation;
        const intonationAndStressId = student.intonation_and_stress;
        const accuracyId = student.accuracy;
        const clarityOfThoughtId = student.clarity_of_thought;
        const syntaxId = student.syntax;
        const qualityOfResponseId = student.quality_of_response;
        const detailOfResponseId = student.detail_of_response;

        const selectedConsistency = consistencyLookup[consistencyId];
        const selectedClarity = clarityLookup[clarityId];
        const selectedArticulation = articulationLookup[articulationId];
        const selectedIntonationAndStress = intonationAndStressLookup[intonationAndStressId];
        const selectedAccuracy = accuracyLookup[accuracyId];
        const selectedQualityOfResponse = qualityOfResponseLookup[qualityOfResponseId];
        const selectedDetailOfResponse = detailOfResponseLookup[detailOfResponseId];
        const selectedClarityOfThought = clarityofthoughtLookup[clarityOfThoughtId];
        const selectedSyntax = syntaxLookup[syntaxId];

        // Gather all relevant data for the row
        const studentData = {
          fullName: `${student.firstname} ${student.lastname}`,
          epgf_average: epgfAverage.toFixed(2),
          proficiency_level: getProficiencyLevel(epgfAverage).level,
          type: student.type || 'Reading',

                          // Pronunciation
          consistency_descriptor: selectedConsistency ? selectedConsistency.descriptor : 'N/A',
          consistency_rating: selectedConsistency ? selectedConsistency.rating : '0.00',
          clarity_descriptor: selectedClarity ? selectedClarity.descriptor : 'N/A',
          clarity_rating: selectedClarity ? selectedClarity.rating : '0.00',
          articulation_descriptor: selectedArticulation ? selectedArticulation.descriptor : 'N/A',
          articulation_rating: selectedArticulation ? selectedArticulation.rating : '0.00',
          intonation_and_stress_descriptor: selectedIntonationAndStress ? selectedIntonationAndStress.descriptor : 'N/A',
          intonation_and_stress_rating: selectedIntonationAndStress ? selectedIntonationAndStress.rating : '0.00',
          pronunciation_average: pronunciationAverage.toFixed(2),

                          // Grammar
          accuracy_descriptor: selectedAccuracy ? selectedAccuracy.descriptor : 'N/A',
          accuracy_rating: selectedAccuracy ? selectedAccuracy.rating : '0.00',
          clarity_of_thought_descriptor: selectedClarityOfThought ? selectedClarityOfThought.descriptor : 'N/A',
          clarity_of_thought_rating: selectedClarityOfThought ? selectedClarityOfThought.rating : '0.00',
          syntax_descriptor: selectedSyntax ? selectedSyntax.descriptor : 'N/A',
          syntax_rating: selectedSyntax ? selectedSyntax.rating : '0.00',
          grammar_average: grammarAverage.toFixed(2),

                          // Fluency
          quality_of_response_descriptor: selectedQualityOfResponse ? selectedQualityOfResponse.descriptor : 'N/A',
          quality_of_response_rating: selectedQualityOfResponse ? selectedQualityOfResponse.rating : '0.00',
          detail_of_response_descriptor: selectedDetailOfResponse ? selectedDetailOfResponse.descriptor : 'N/A',
          detail_of_response_rating: selectedDetailOfResponse ? selectedDetailOfResponse.rating : '0.00',
          fluency_average: fluencyAverage.toFixed(2),

          comment: student.comment,
          course_code: course_code,
          task_title: taskTitle || "No Title",
          epgf_rubric_id: version,
          student_id: `${student.student_id}`,
          department: `${student.department}`,
          program: `${student.program}`,
          course_title: course_title,
          year_level: `${student.year_level}`,
        };

        // Helper function to check for '0.00' or 'N/A'
        const isInvalidData = (data) => {
          return data === '0.00' || data === 'N/A';
        };

        // Create an array of keys to exclude from the validation check
        const excludedKeys = [
          'task_title',
          'epgf_average',
          'proficiency_level',
          'comment',
          'course_code',
          'epgf_rubric_id',
          'student_id',
          'department',
          'program',
        ];

        // Check if any of the relevant fields (not in the excluded list) have '0.00' or 'N/A'
        for (const [key, value] of Object.entries(studentData)) {
          if (!excludedKeys.includes(key) && isInvalidData(value)) {
            alert(`Please check the value for ${key} before submitting.`);
            return;  // Exit the function if invalid data is found
          }
        }

        try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
          const response = await fetch('/api/eie-scorecard-class-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(studentData),
          });

          const text = await response.text(); // Get the raw response text

          if (response.ok) {
            try {
              const result = JSON.parse(text); // Attempt to parse the response
              window.location.reload();
            } catch (parseError) {
              console.error('Failed to parse JSON:', parseError);  // Handle JSON parsing errors
            }
          } else {
            console.error('Failed to store data. Response status:', response.status);  // Log response status
            console.error('Response body:', text);  // Log response body for further investigation
          }
        } catch (error) {
          console.error('Error during fetch:', error);  // Log any network or other errors
        }
      };

      return (
        <tr key={rowIndex}>
        <td>{rowIndex + 1}</td>
        <td><div style={{ textAlign: 'center' }}>{`${student.firstname} ${student.lastname}`}</div></td>
        <td><div style={{ textAlign: 'center' }}>{student.student_id}</div></td>
        <td><div style={{ textAlign: 'center' }}>{student.year_level}</div></td>
        <td><div style={{ textAlign: 'center' }}>{student.program}</div></td>
        {/* PGF Average */}
        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}> {epgfAverage.toFixed(2)} </div>
        </td>

        {/* Proficiency Level */}
        <td>
        {(() => {
          const { level, color } = getProficiencyLevel(epgfAverage);
          return (
            <div
            style={{
              textAlign: 'center',
              fontWeight: '600',
              backgroundColor: color,
              color: 'white',
              padding: '5px',
              borderRadius: '5px',
            }}
            >
            {level}
            </div>
          );
        })()}
        </td>

        <td>
        <select
        value={student.type || ''}
        onChange={(e) => updateData(rowIndex, 'type', e.target.value)}
        style={{ width: '100px', padding: '4px', backgroundColor: 'transparent' }}
        >
        <option value="Reading">Reading</option>
        <option value="Writing">Writing</option>
        <option value="Listening">Listening</option>
        </select>
        </td>

        <td>
        <select
        value={student.consistency || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value);
          const selectedOption = consistencyLookup[selectedId];

          if (selectedOption) {
            // Update consistency state
            updateData(rowIndex, 'consistency', selectedId); // Store the ID, not the descriptor string
            // Now update the displayed rating directly below the select
            updateData(rowIndex, 'consistencyRating', selectedOption.rating); // Assuming you want to update the rating as well
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {consistencyOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Loading state if options are not yet available
        ) : (
          consistencyOptions.map(option => (
            <option
            key={option.id}
            value={option.id}
            style={{ fontSize: '10px', whiteSpace: 'pre-line' }}
            >
            {option.descriptor.split('.').join(' \n')}
            </option>
          ))
        )}
        </select>

        {/* Display only the rating without consistency descriptor */}
        <span style={{ fontSize: '12px', marginTop: '4px', display: 'block', textAlign: 'left' }}>
        Rating: {student.consistency ? consistencyLookup[student.consistency]?.rating || '0.00' : '0.00'}
        </span>
        </td>

        <td> <div style={{ textAlign: 'center', fontWeight: '600' }}> {consistencyRating} </div></td>

        {/* Clarity dropdown */}
        <td>
        <select
        value={student.clarity || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value);  // Ensure ID is a number
          const selectedOption = clarityLookup[selectedId];  // Lookup the option by ID

          if (selectedOption) {
            // Update clarity state (Store the ID, not the descriptor string)
            updateData(rowIndex, 'clarity', selectedId);

            // Now update the displayed rating directly below the select
            updateData(rowIndex, 'clarityRating', selectedOption.rating); // Update the rating as well
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {clarityOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Loading state if options are not yet available
        ) : (
          clarityOptions.map(option => (
            <option
            key={option.id}
            value={option.id}
            style={{ fontSize: '10px', whiteSpace: 'pre-line' }}
            >
            {option.descriptor.split('.').join(' \n')}  {/* Format descriptor for better readability */}
            </option>
          ))
        )}
        </select>

        {/* Display only the rating without clarity descriptor */}
        <span style={{ fontSize: '12px', marginTop: '4px', display: 'block', textAlign: 'left' }}>
        Rating: {student.clarity ? clarityLookup[student.clarity]?.rating || '0.00' : '0.00'}
        </span>
        </td>

        <td> <div style={{ textAlign: 'center', fontWeight: '600' }}> {clarityRating} </div></td>

        {/* Articulation dropdown */}
        <td>
        <div>
        <select
        value={student.articulation || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value);  // Ensure the selected value is treated as a number
          const selectedOption = articulationLookup[selectedId];  // Lookup articulation option by ID

          if (selectedOption) {
            // Update articulation state (Store the ID)
            updateData(rowIndex, 'articulation', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'articulationRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {articulationOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          articulationOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.');  // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line',  // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        {/* Display the articulation rating below the dropdown */}
        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.articulation ? articulationLookup[student.articulation]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        {/* Display articulation rating in a separate column */}
        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {articulationRating}
        </div>
        </td>


        {/* Intonation and Stress dropdown */}
        <td>
        <div>
        <select
        value={student.intonation_and_stress || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = intonationAndStressLookup[selectedId]; // Lookup intonation and stress option by ID

          if (selectedOption) {
            // Update intonation_and_stress state (Store the ID)
            updateData(rowIndex, 'intonation_and_stress', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'intonationAndStressRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {intonationAndStressOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          intonationAndStressOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        {/* Display the intonation and stress rating below the dropdown */}
        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.intonation_and_stress ? intonationAndStressLookup[student.intonation_and_stress]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {intonationAndStressRating}
        </div>
        </td>

        {/* Pronunciation Average */}
        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {pronunciationAverage.toFixed(2)}
        </div>
        </td>

        {/* Grammar */}
        {/* Accuracy dropdown */}
        <td>
        <div>
        <select
        value={student.accuracy || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = accuracyLookup[selectedId]; // Lookup accuracy option by ID

          if (selectedOption) {
            // Update accuracy state (Store the ID)
            updateData(rowIndex, 'accuracy', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'accuracyRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {accuracyOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          accuracyOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>


        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.accuracy ? accuracyLookup[student.accuracy]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {accuracyRating}
        </div>
        </td>

        {/* ClarityofThought */}
        <td>
        <div>
        <select
        value={student.clarity_of_thought || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = clarityofthoughtLookup[selectedId]; // Lookup clarity_of_thought option by ID

          if (selectedOption) {
            // Update clarity_of_thought state (Store the ID)
            updateData(rowIndex, 'clarity_of_thought', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'clarity_of_thought_rating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {clarityofthoughtOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          clarityofthoughtOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.clarity_of_thought ? clarityofthoughtLookup[student.clarity_of_thought]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {clarityofthoughtRating}
        </div>
        </td>

        {/* syntax */}
        <td>
        <div>
        <select
        value={student.syntax || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = syntaxLookup[selectedId]; // Lookup syntax option by ID

          if (selectedOption) {
            // Update syntax state (Store the ID)
            updateData(rowIndex, 'syntax', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'syntaxRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {syntaxOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          syntaxOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.syntax ? syntaxLookup[student.syntax]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {syntaxRating}
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {grammarAverage.toFixed(2)}
        </div>
        </td>

        {/* Fluency */}
        {/* Quality Of Response */}
        <td>
        <div>
        <select
        value={student.quality_of_response || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = qualityOfResponseLookup[selectedId]; // Lookup Quality Of Response option by ID

          if (selectedOption) {
            // Update Quality Of Response state (Store the ID)
            updateData(rowIndex, 'quality_of_response', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'qualityOfResponseRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {qualityOfResponseOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          qualityOfResponseOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.quality_of_response ? qualityOfResponseLookup[student.quality_of_response]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {qualityOfResponseRating}
        </div>
        </td>

        {/* Detail Of Response */}
        <td>
        <div>
        <select
        value={student.detail_of_response || ''}
        onChange={(e) => {
          const selectedId = Number(e.target.value); // Ensure the selected value is treated as a number
          const selectedOption = detailOfResponseLookup[selectedId]; // Lookup Quality Of Response option by ID

          if (selectedOption) {
            // Update Quality Of Response state (Store the ID)
            updateData(rowIndex, 'detail_of_response', selectedId);

            // Now update the rating directly below the select dropdown
            updateData(rowIndex, 'detailOfResponseRating', selectedOption.rating); // Store the rating in the row
          }
        }}
        style={{
          padding: '4px',
          backgroundColor: 'transparent',
          width: '350px',
        }}
        >
        {detailOfResponseOptions.length === 0 ? (
          <option disabled>EPGF Rubric Version Not Set</option> // Show loading state if options are not available
        ) : (
          detailOfResponseOptions.map(option => {
            const splitDescriptor = option.descriptor.split('.'); // Split descriptor to add line breaks
            const formattedDescriptor = splitDescriptor.join(' \n');

            return (
              <option
              key={option.id}
              value={option.id}
              style={{
                fontSize: '10px',
                whiteSpace: 'pre-line', // Ensure the formatting with line breaks is respected
              }}
              >
              {formattedDescriptor}
              </option>
            );
          })
        )}
        </select>

        <span
        style={{
          fontSize: '12px',
          marginTop: '4px',
          display: 'block',
          textAlign: 'left',
        }}
        >
        Rating: {student.detail_of_response ? detailOfResponseLookup[student.detail_of_response]?.rating || '0.00' : '0.00'}
        </span>
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {detailOfResponseRating}
        </div>
        </td>

        <td>
        <div style={{ textAlign: 'center', fontWeight: '600' }}>
        {fluencyAverage.toFixed(2)}
        </div>
        </td>

        {/* Comment */}
        <td>
        {/* Textarea for the "Comment" column */}
        <textarea
        value={student.comment}
        onChange={(e) => updateData(rowIndex, 'comment', e.target.value)}
        style={{
          width: '450px',
          height: '40px',
          padding: '4px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          resize: 'vertical',
        }}
        aria-label={`Edit comment for ${student.fullName}`}
        placeholder="Leave a comment (optional)"
        />
        </td>

        <td>
        <div style={{ textAlign: 'center' }}>
        <SubmitButton
        onClick={() => handleRowSubmit(rowIndex)}
        disabled={submittedIds.includes(students[rowIndex].student_id)}
        >
        {submittedIds.includes(students[rowIndex].student_id) ? 'Submitted' : 'Submit'}
        </SubmitButton>
        </div>
        </td>

        </tr>
      );
    })}
    </tbody>

    </table>
    </div>
  );
};

export default TableComponent;
