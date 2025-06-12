import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css';

const EmotionalRankingTable = ({ surveyData }) => {
  const [rankedData, setRankedData] = useState([]);

  useEffect(() => {
    if (!surveyData || surveyData.length === 0) return;

    // Filter ER codes
    const erItems = surveyData.filter(item => item.questionCode.startsWith('ER'));

    // Map ER items to structured data
    const erMapped = erItems.map(item => ({
      code: item.questionCode,
      percentage: item.percentage
    }));

    // Sort by percentage descending
    const sorted = [...erMapped].sort((a, b) => b.percentage - a.percentage);

    // Assign ranks
    const ranked = sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setRankedData(ranked);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Emotional Intelligence Ranking</h2>
      <table className="strength-table" aria-label="Emotional Intelligence Ranking Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
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

export default EmotionalRankingTable;
