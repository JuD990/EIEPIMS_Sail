import React, { useState, useEffect } from "react";

const NonGraduatingRemarks = ({ onDataChange }) => {
    const [remarks, setRemarks] = useState({
        pgf_specific_remarks: "",
        school_year_highlight: "",
        school_year_lowlight: "",
        spark_highlight: "",
        spark_lowlight: "",
        usage_in_school_online: "",
        usage_offline: "",
        support_needed: ""
    });

    const labels = {
        pgf_specific_remarks: "PGF Specific Remarks",
        school_year_highlight: "School Year Highlight",
        school_year_lowlight: "School Year Lowlight",
        spark_highlight: "SPARK Highlight",
        spark_lowlight: "SPARK Lowlight",
        usage_in_school_online: "Usage in School/Online (When in School)",
        usage_offline: "Usage Offline (Home or Outside)",
        support_needed: "Support Needed"
    };

    const handleChange = (e, key) => {
        const updated = { ...remarks, [key]: e.target.value };
        setRemarks(updated);
    };

    useEffect(() => {
        if (onDataChange) {
            onDataChange(remarks);
        }
    }, [remarks, onDataChange]);

    return (
        <div>
        <h2 className="text-xl font-bold mb-4">Non-Graduating Student Remarks</h2>
        {Object.entries(remarks).map(([key, value]) => (
            <div key={key} className="mb-4">
            <label className="block font-semibold">{labels[key]}</label>
            <textarea
            value={value}
            onChange={(e) => handleChange(e, key)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={2}
            />
            </div>
        ))}
        </div>
    );
};

export default NonGraduatingRemarks;
