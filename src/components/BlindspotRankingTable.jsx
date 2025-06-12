import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css'; // Reusing the same styles

const BlindspotRankingTable = ({ surveyData }) => {
  const [rankedData, setRankedData] = useState([]);

  useEffect(() => {
    if (!surveyData || surveyData.length === 0) return;

    // Define BS group mappings
    const bsGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    const groupAverages = Object.entries(bsGroups).map(([groupCode, questionCodes]) => {
      const groupItems = surveyData.filter(item => questionCodes.includes(item.questionCode));
      const totalPercentage = groupItems.reduce((sum, item) => sum + (item.percentage || 0), 0);
      const average = groupItems.length ? Math.round(totalPercentage / groupItems.length) : 0;

      return { code: groupCode, percentage: average };
    });

    // Sort by percentage descending and assign rank
    const sortedWithRank = [...groupAverages]
      .sort((a, b) => b.percentage - a.percentage)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    setRankedData(sortedWithRank);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Blindspot Ranking Summary</h2>
      <table className="strength-table" aria-label="Blindspot Ranking Table">
        <thead>
          <tr>
            <th scope="col">BS Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Rank</th>
          </tr>
        </thead>
        <tbody>
          {rankedData.map(({ code, percentage, rank }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{rank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlindspotRankingTable;
