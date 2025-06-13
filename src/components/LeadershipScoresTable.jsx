import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css';

const LeadershipScoresTable = ({ surveyData }) => {
  const [leadershipScores, setLeadershipScores] = useState([]);

  useEffect(() => {
    // Helper: Calculate average percentage for given question codes
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter(item => codes.includes(item.questionCode));
      const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    // Leadership Groupings
    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7'],
      LTB: ['LT8', 'LT9', 'LT10', 'LT11', 'LT12', 'LT13', 'LT14'],
    };

    // Generate table data
    const scores = Object.entries(leadershipGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      const description = `This percentage is the average of ${codes.join(', ')} from Table 1.`;
      return {
        code,
        percentage: avg,
        description
      };
    });

    setLeadershipScores(scores);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Leadership Scores</h2>
      <table className="strength-table" aria-label="Leadership Scores Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {leadershipScores.map(({ code, percentage }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadershipScoresTable;
