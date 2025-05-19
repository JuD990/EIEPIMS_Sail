import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from "../../sidebar/esl-sidebar";
import UserInfo from '@user-info/User-info';
import "./esl-interview-scorecard.css";
import Table from "./table/interview-scorecard-table";
import InterviewScorecardButtons from "./interview-scorecard-buttons/interview-scorecard-buttons";
import RemarksDropdown from './remarks-templates/dropdown-remarks';

const eslPrimeDiagnostics = () => {
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categoryAverages, setCategoryAverages] = useState({});
    const [options, setOptions] = useState({
        consistency: [],
        clarity: [],
        articulation: [],
        intonationAndStress: [],
        accuracy: [],
        clarityOfThought: [],
        syntax: [],
        qualityOfResponse: [],
        detailOfResponse: []
    });

    const [ratings, setRatings] = useState({});
    const [overallAverage, setOverallAverage] = useState("0.00");
    const [dropdownValues, setDropdownValues] = useState({
        consistency: "",
        clarity: "",
        articulation: "",
        intonationAndStress: "",
        accuracy: "",
        clarityOfThought: "",
        syntax: "",
        qualityOfResponse: "",
        detailOfResponse: "",
    });

    useEffect(() => {
        const fetchVersionAndOptions = async () => {
            try {
                const versionResponse = await axios.get('/api/rubric/active-version');
                const versionString = versionResponse.data.version;

                if (!versionString) {
                    console.error("No version found in the response", versionResponse.data);
                    return;
                }

                const versionMatch = versionString.match(/^v(\d+)/);
                if (versionMatch) {
                    const majorVersion = versionMatch[1];
                    setVersion(majorVersion);
                    await fetchOptions(majorVersion);
                } else {
                    console.error("Version string doesn't match the expected format:", versionString);
                }
            } catch (error) {
                console.error("Error fetching version:", error);
            }
        };

        const fetchOptions = async (version) => {
            const categories = [
                'consistency', 'clarity', 'articulation', 'intonationStress', 'accuracy',
              'clarityOfThought', 'syntax', 'qualityOfResponse', 'detailOfResponse'
            ];

            const newOptions = {};

            try {
                await Promise.all(
                    categories.map(async (category) => {
                        const response = await axios.get(`/api/${category}/${version}`);
                        if (response.status === 200 && Array.isArray(response.data)) {
                            newOptions[category] = response.data.map(item => ({
                                id: item.id,
                                pronunciation: item.pronunciation,
                                rating: item.rating,
                                descriptor: item.descriptor,
                            }));
                        } else {
                            console.error(`${category} options not found or response data is not an array`);
                        }
                    })
                );

                setOptions(newOptions);
            } catch (error) {
                console.error("Error fetching options:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!version) {
            fetchVersionAndOptions();
        }
    }, [version]);

    const handleOverallAverageChange = (avg) => {
        setOverallAverage(avg);
    };

    const handleCategoryAveragesChange = (averages) => {
        setCategoryAverages(averages);
    };

    const [remarks, setRemarks] = useState({
        "PGF Specific Remarks": "",
        "School Year Highlight": "",
        "School Year Lowlight": "",
        "SPARK Highlight": "",
        "SPARK Lowlight": "",
        "Usage in School/Online (When in School)": "",
        "Usage Offline (Home or Outside)": "",
        "Support Needed": ""
    });

    const handleClear = () => {
        setRatings({});
        setOverallAverage("0.00");
        setDropdownValues({
            consistency: "",
            clarity: "",
            articulation: "",
            intonationAndStress: "",
            accuracy: "",
            clarityOfThought: "",
            syntax: "",
            qualityOfResponse: "",
            detailOfResponse: "",
        });
        setRemarks({
            "PGF Specific Remarks": "",
            "School Year Highlight": "",
            "School Year Lowlight": "",
            "SPARK Highlight": "",
            "SPARK Lowlight": "",
            "Usage in School/Online (When in School)": "",
            "Usage Offline (Home or Outside)": "",
            "Support Needed": ""
        });
    };

    const [formData, setFormData] = useState({
        name: "",
        student_id: "",
        yearLevel: "",
        interviewer: "",
        venue: "Online",
        program: "",
        department: "",
        date: "",
        time: "",
    });

    // Define currentDate and currentTime
    const [currentDate, setCurrentDate] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        const formattedTime = today.toTimeString().slice(0, 5);

        setCurrentDate(formattedDate);
        setCurrentTime(formattedTime);

        setFormData((prev) => ({
            ...prev,
            date: formattedDate,
            time: formattedTime,
        }));
    }, []);

    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [nameSearch, setNameSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const employeeId = localStorage.getItem("employee_id");

        if (employeeId) {
            axios.get(`/api/esl/employee/${employeeId}`)
            .then((response) => {
                if (response.data.full_name) {
                    setFormData((prev) => ({
                        ...prev,
                        interviewer: response.data.full_name
                    }));
                }
            })
            .catch((error) => {
                console.error("Failed to fetch interviewer:", error);
            });
        }
    }, []);

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstname} ${student.middlename || ""} ${student.lastname}`.toLowerCase();
        return fullName.includes(nameSearch.toLowerCase());
    });

    const handleStudentSelect = (student) => {
        const fullName = `${student.firstname} ${student.middlename || ""} ${student.lastname}`.trim();

        setFormData(prev => ({
            ...prev,
            name: fullName,
            student_id: student.student_id,
            program: student.program,
            year_level: student.year_level,
        }));

        console.log("Selected Student ID:", student.student_id);

        setIsDropdownOpen(false);
        setNameSearch("");
    };



    useEffect(() => {
        const fetchStudents = async () => {
            if (formData.department && formData.yearLevel) {
                try {
                    const response = await axios.get("http://localhost:8000/api/master-class-list-students", {
                        params: {
                            department: formData.department,
                            yearLevel: formData.yearLevel,
                        }
                    });

                    // Debug log to see student_id of each student
                    console.log("Fetched student IDs:", response.data.map(student => student.student_id));

                    setStudents(response.data);
                } catch (error) {
                    console.error("Error fetching students:", error);
                }
            }
        };

        fetchStudents();
    }, [formData.department, formData.yearLevel]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/master-class-list-department");
                setDepartments(response.data);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };
    const studenId = formData.student_id;
    console.log(studenId); // use this for update !!!!!!!

    return (
        <div>
        <Sidebar />
        <UserInfo />
        <br /><br /><br /><br /><br />
        <h1 style={{ fontFamily: 'Epilogue', fontWeight: 800, marginLeft: '340px', color: '#383838' }}>
        EIE Diagnostics
        </h1>

        <div className="esl-interview-scorecard-container">
        {loading && (
            <div style={{ textAlign: "center", padding: "5px", color: "#888" }}>
            EPGF Rubric version not set.
            </div>
        )}

        <InterviewScorecardButtons
        onClear={handleClear}
        overallAverage={overallAverage}
        ratings={ratings}
        remarks={remarks}
        setRemarks={setRemarks}
        categoryAverages={categoryAverages}
        formData={formData}
        setFormData={setFormData}
        currentDate={currentDate}
        currentTime={currentTime}
        students={students}
        filteredStudents={filteredStudents}
        departments={departments}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        handleInputChange={handleInputChange}
        nameSearch={nameSearch}
        setNameSearch={setNameSearch}
        handleStudentSelect={handleStudentSelect}
        />

        <Table
        options={options}
        onOverallAverageChange={handleOverallAverageChange}
        onClear={handleClear}
        ratings={ratings}
        setRatings={setRatings}
        dropdownValues={dropdownValues}
        setDropdownValues={setDropdownValues}
        onCategoryAveragesChange={handleCategoryAveragesChange}
        studenId={studenId}
        />

        <RemarksDropdown remarks={remarks} setRemarks={setRemarks} yearLevel={formData.yearLevel} />

        </div>
        </div>
    );
};

export default eslPrimeDiagnostics;
