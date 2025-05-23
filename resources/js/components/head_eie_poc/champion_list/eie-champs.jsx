import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";
import EIEHeadSidebar from '../sidebar/eie-head-sidebar';
import UserInfo from '@user-info/User-info';
import "./eie-champs.css";
import ChampListTable from "./champs-table/list-champs-table";

const ChampionCandidates = () => {

    const [topChampions, setTopChampions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const employeeId = localStorage.getItem("employee_id");
        if (!employeeId) return;

        setLoading(true);
        setError("");

        fetch(`/api/top-epgf?employee_id=${employeeId}`)
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch top students.");
            return res.json();
        })
        .then((data) => {
            // Flatten grouped data and format year level
            const allStudents = Object.entries(data).flatMap(([year, students]) => {
                return students.map(student => ({
                    ...student,
                    year_level_display: formatYearLevel(student.year_level)
                }));
            });

            setTopChampions(allStudents);
        })
        .catch((err) => {
            console.error(err);
            setError("Unable to load top students.");
        })
        .finally(() => setLoading(false));
    }, []);

    // Helper function for "1st Year", "2nd Year", etc.
    const formatYearLevel = (value) => {
        const v = parseInt(value, 10);
        const suffixes = ["th", "st", "nd", "rd"];
        const s = (v % 10 <= 3 && v % 100 !== 11 && v % 100 !== 12 && v % 100 !== 13)
        ? suffixes[v % 10]
        : suffixes[0];
        return `${v}${s} Year`;
    };

    const handleSelect = (student) => {
        console.log("Selected student:", student);
        // Do something with selected student...
    };

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

    return (
        <div>
        <EIEHeadSidebar />
        <UserInfo />
        <br /><br /><br /><br />
        <div className="eie-champ-container">
            <h1>
                Select Monthly Champion - {currentSemester}
            </h1>
            <ChampListTable
            data={topChampions}
            searchQuery={searchQuery}
            selectedProgram={selectedProgram}
            selectedYearLevel={selectedYearLevel}
            onSelect={handleSelect}
            />
        </div>
        </div>
    );
};

export default ChampionCandidates;
