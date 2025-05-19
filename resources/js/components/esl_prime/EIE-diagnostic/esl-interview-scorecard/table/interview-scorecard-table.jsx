import React, { useState, useEffect } from "react";
import "./interview-scorecard-table.css";

const Table = ({
    options,
    onOverallAverageChange,
    onClear,
    ratings,
    setRatings,
    dropdownValues,
    setDropdownValues,
    onCategoryAveragesChange,
    studenId
}) => {

    const categories = [
        { category: "Pronunciation", descriptors: ["Consistency", "Clarity", "Articulation", "Intonation & Stress"] },
        { category: "Grammar", descriptors: ["Accuracy", "Clarity of Thought", "Syntax"] },
        { category: "Fluency", descriptors: ["Quality of Response", "Detail of Response"] }
    ];

    const descriptorToOptionKey = {
        "Consistency": "consistency",
        "Clarity": "clarity",
        "Articulation": "articulation",
        "Intonation & Stress": "intonationStress",
        "Accuracy": "accuracy",
        "Clarity of Thought": "clarityOfThought",
        "Syntax": "syntax",
        "Quality of Response": "qualityOfResponse",
        "Detail of Response": "detailOfResponse"
    };

    const handleDescriptorChange = (descriptor, selectedDescriptor) => {
        const optionKey = descriptorToOptionKey[descriptor];
        const selectedOption = options[optionKey]?.find(option => option.descriptor === selectedDescriptor);

        setRatings(prev => ({
            ...prev,
            [descriptor]: {
                rating: selectedOption ? selectedOption.rating : "",
                descriptor: selectedDescriptor
            }
        }));
    };

    const handleRemarksChange = (label, value) => {
        setRemarks(prev => ({
            ...prev,
            [label]: value
        }));
    };

    const calculateCategoryAverage = (category) => {
        const ratingsForCategory = category.descriptors.map(descriptor => {
            const rating = ratings[descriptor]?.rating;
            return rating ? parseFloat(rating) : 0;
        });

        const validRatings = ratingsForCategory.filter(rating => rating !== 0);
        const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;

        return isNaN(average) ? 0 : average.toFixed(2);
    };

    const calculateOverallAverage = () => {
        const allCategoryAverages = categories.map(category => calculateCategoryAverage(category));
        const validCategoryAverages = allCategoryAverages.filter(avg => avg !== "0.00");
        const overallAverage = validCategoryAverages.reduce((sum, avg) => sum + parseFloat(avg), 0) / validCategoryAverages.length;

        return isNaN(overallAverage) ? 0 : overallAverage.toFixed(2);
    };

    const collectAllInputs = () => {
        const categoryAverages = {};
        categories.forEach(category => {
            categoryAverages[category.category] = calculateCategoryAverage(category);
        });

        return {
            ratings,
            remarks,
            categoryAverages,
            overallAverage: calculateOverallAverage()
        };
    };

    // Handle clearing local states and invoking parent's onClear function
    const handleClearLocal = () => {
        // Clear all states
        setRatings({});
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

        // Call the parent's onClear function if it exists
        if (onClear) {
            onClear();
        }
    };

    useEffect(() => {
        const categoryAverages = {};
        categories.forEach(category => {
            categoryAverages[category.category] = calculateCategoryAverage(category);
        });

        const overallAverage = calculateOverallAverage();

        onCategoryAveragesChange(categoryAverages);
        if (onOverallAverageChange) {
            onOverallAverageChange(overallAverage);
        }
    }, [ratings]);

    let globalRowIndex = 0; // outside the map


    return (
        <div className="esl-scorecard-table-container">
        <table className="esl-scorecard-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ textAlign: 'center' }}>
        <tr>
        <th className="vertical-header" style={{ padding: '8px' }}></th>
        <th className="horizontal-values" style={{ padding: '8px' }}>PGF</th>
        <th style={{ padding: '8px' }}>Descriptor</th>
        <th style={{ padding: '8px' }}>Rating</th>
        <th style={{ padding: '8px' }}>Average Rating per PGF</th>
        <th className="no-border-bottom" style={{ padding: '8px' }}>Average Rating</th>
        <th style={{ padding: '8px' }}>Previous Average Rating per PGF</th>
        <th className="no-border-bottom" style={{ padding: '8px' }}>Previous Average Rating</th>
        </tr>
        </thead>
        <tbody>
        {categories.map((category, index) => {
            const categoryAverage = calculateCategoryAverage(category);

            return (
                <React.Fragment key={index}>
                <tr>
                <td
                className="vertical-text"
                rowSpan={category.descriptors.length + 1}
                style={{ border: '1px solid #ddd', padding: '8px' }}
                >
                {category.category}
                </td>
                </tr>

                {category.descriptors.map((descriptor, i) => {
                    const selectedDescriptor = ratings[descriptor]?.descriptor;
                    const optionKey = descriptorToOptionKey[descriptor];
                    globalRowIndex++; // Increment the row index

                    // Check if it's the 4th or 7th row for the Previous Average Rating per PGF column
                    const isFourthRow = globalRowIndex === 4;
                    const isSeventhRow = globalRowIndex === 7;

                    return (
                        <tr
                        key={i}
                        style={{
                            borderBottom:
                            globalRowIndex === 9
                            ? "1px solid #ddd" // Thick border for specific rows
                            : "none",
                        }}
                        >
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {descriptor}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <div className="esl-table-dropdown-wrapper">
                        <select
                        className="esl-table-dropdown"
                        value={selectedDescriptor || ""}
                        onChange={(e) => handleDescriptorChange(descriptor, e.target.value)}
                        >
                        <option value="">Select</option>
                        {options[optionKey]?.map((option) => (
                            <option key={option.id} value={option.descriptor}>
                            {option.descriptor}
                            </option>
                        ))}
                        </select>
                        </div>
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {ratings[descriptor]?.rating || "N/A"}
                        </td>
                        <td
                        style={{
                            borderTop: "none", // Keeps top border none
                            borderBottom: isFourthRow || isSeventhRow ? "1px solid #ddd" : "none", // Bottom border only for 4th and 7th row
                            borderRight: "1px solid #ddd", // Keeps right border
                            padding: "8px",
                        }}
                        >
                        {categoryAverage}
                        </td>
                        <td
                        style={{
                            borderTop: "none", // Keeps top border none
                            borderBottom: "none", // Removes bottom border for Average Rating column
                            borderRight: "1px solid #ddd", // Keeps right border
                            padding: "8px",
                        }}
                        >
                        {calculateOverallAverage()}
                        </td>
                        {/* Column 6 (Previous Average Rating per PGF) */}
                        <td
                        style={{
                            borderTop: "none", // Keeps top border none
                            borderBottom: isFourthRow || isSeventhRow ? "1px solid #ddd" : "none", // Bottom border only for 4th and 7th row
                            borderRight: "1px solid #ddd", // Keeps right border
                            padding: "8px",
                        }}
                        >
                        -
                        </td>
                        {/* Column 8 (Previous Average Rating) */}
                        <td
                        style={{
                            borderTop: "none", // Keeps top border none
                            borderBottom: "none", // Removes bottom border
                            borderRight: "1px solid #ddd", // Keeps right border
                            padding: "8px",
                        }}
                        >
                        -
                        </td>
                        </tr>
                    );
                })}
                </React.Fragment>
            );
        })}
        </tbody>
        </table>
        </div>
    );

};

export default Table;
