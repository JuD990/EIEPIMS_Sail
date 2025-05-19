import React, { useState, useEffect, useCallback } from 'react';
import GraduatingRemarks from './GraduatingRemarks';
import NonGraduatingRemarks from './NonGraduatingRemarks';

const RemarksDropdown = ({ setRemarks, yearLevel }) => {
    // Set default selectedOption based on yearLevel
    const [selectedOption, setSelectedOption] = useState(
        yearLevel === '4th Year' ? 'graduating' : 'nonGraduating'
    );

    // Update selectedOption when dropdown changes
    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value);
    };

    // Memoize callbacks to prevent infinite loops
    const handleGraduatingDataChange = useCallback((data) => {
        setRemarks(data);
    }, [setRemarks]);

    const handleNonGraduatingDataChange = useCallback((data) => {
        setRemarks(data);
    }, [setRemarks]);

    useEffect(() => {
        // Update selectedOption if yearLevel changes
        setSelectedOption(yearLevel === '4th Year' ? 'graduating' : 'nonGraduating');
    }, [yearLevel]);

    return (
        <div style={{ textAlign: 'left', marginTop: '-40px' }}>
        <select
        onChange={handleSelectChange}
        value={selectedOption}
        style={{ width: '200px', backgroundColor: "#FBF7F7" }}
        >
        <option value="graduating">Graduating</option>
        <option value="nonGraduating">Non-Graduating</option>
        </select>

        {selectedOption === 'graduating' && (
            <GraduatingRemarks onDataChange={handleGraduatingDataChange} />
        )}
        {selectedOption === 'nonGraduating' && (
            <NonGraduatingRemarks onDataChange={handleNonGraduatingDataChange} />
        )}
        </div>
    );
};

export default RemarksDropdown;
