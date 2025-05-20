import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './candidates.css';

function ChampionsBySemester({ department, schoolYear }) {
    const [championsData, setChampionsData] = useState({
        '1st Semester': null,
        '2nd Semester': null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChampions = async (semester) => {
        try {
            const response = await axios.get('/api/champions-report', {
                params: { department, semester, schoolYear },
            });
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch champions');
            }
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        if (!department || !schoolYear) return;

        setLoading(true);
        setError(null);

        Promise.all([
            fetchChampions('1st Semester'),
                    fetchChampions('2nd Semester'),
        ])
        .then(([firstSemData, secondSemData]) => {
            setChampionsData({
                '1st Semester': firstSemData,
                '2nd Semester': secondSemData,
            });
        })
        .catch((err) => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [department, schoolYear]);

    const renderChampionsTable = (data) => {
        const hasYearTotal = data?.yearTotalChampions && Object.keys(data.yearTotalChampions).length > 0;

        const yearTotalRows = hasYearTotal
        ? Object.entries(data.yearTotalChampions).map(([yearLevel, champ]) => (
            <tr key={yearLevel}>
            <td>{yearLevel}</td>
            <td>{champ?.champion || 'N/A'}</td>
            <td>{champ?.student_id || 'N/A'}</td>
            <td>{champ?.epgf_average !== undefined ? champ.epgf_average : 'N/A'}</td>
            <td>Monthly Winner</td>
            <td>{champ?.times_won !== undefined ? `${champ.times_won}x` : 'N/A'}</td>
            </tr>
        ))
        : [];

        const grandChampion = data?.grandChampion;

        const grandChampionRow = (
            <tr key="grandChampion" className="champions-bold-row">
            <td>Semestral Total</td>
            <td>{grandChampion?.champion || 'N/A'}</td>
            <td>{grandChampion?.student_id || 'N/A'}</td>
            <td>{grandChampion?.epgf_average !== undefined ? grandChampion.epgf_average : 'N/A'}</td>
            <td>Semestral Champion</td>
            <td>{grandChampion?.times_won !== undefined ? `${grandChampion.times_won}x` : 'N/A'}</td>
            </tr>
        );

        const hasAnyData = hasYearTotal || grandChampion;

        return (
            <table className="champions-table">
            <thead>
            <tr>
            <th>Year Level</th>
            <th>Champion</th>
            <th>Student ID</th>
            <th>EPGF Average</th>
            <th>Title</th>
            <th>Times Won</th>
            </tr>
            </thead>
            <tbody>
            {yearTotalRows}
            {grandChampionRow}
            {!hasAnyData && (
                <tr>
                <td colSpan="6" className="champions-no-data">
                No data available.
                </td>
                </tr>
            )}
            </tbody>
            </table>
        );
    };

    if (loading) return <div className="champions-loading">Loading champions...</div>;
    if (error) return <div className="champions-error">Error: {error}</div>;

    return (
        <div className="champions-container">
        <h2 className="champions-header">Champions by Semester</h2>

        <section>
        <h3 className="champions-sem-header">1st Semester</h3>
        {renderChampionsTable(championsData['1st Semester'])}
        </section>

        <section className="champions-sem-section">
        <h3 className="champions-sem-header">2nd Semester</h3>
        {renderChampionsTable(championsData['2nd Semester'])}
        </section>
        </div>
    );
}

export default ChampionsBySemester;
