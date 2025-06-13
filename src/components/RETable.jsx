import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css';
import recommendationDescriptions from '../Json/RE.json';

const RETable = ({ surveyData }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter(item => codes.includes(item.questionCode));
      const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7'],
      LTB: ['LT8', 'LT9', 'LT10', 'LT11', 'LT12', 'LT13', 'LT14'],
    };

    const blindspotGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    const erCodes = ['ER1', 'ER2', 'ER3', 'ER4', 'ER5', 'ER6'];

    // Leadership RE
    const leadershipRE = Object.entries(leadershipGroups).map(([code, codes]) => ({
      code,
      percentage: getAveragePercentage(codes),
      recommendation: mapREText(code),
    }));

    // Blindspot ranked (desc by percentage)
    const bsRanked = Object.entries(blindspotGroups)
      .map(([code, codes]) => ({
        code,
        percentage: getAveragePercentage(codes),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const bsRank5 = bsRanked[4]; // Rank 5
    const bsRank4 = bsRanked[3]; // Rank 4

    const blindspotRE = [
      bsRank5 ? { code: bsRank5.code, percentage: bsRank5.percentage, recommendation: mapREText(bsRank5.code) } : null,
      bsRank4 ? { code: bsRank4.code, percentage: bsRank4.percentage, recommendation: mapREText(bsRank4.code) } : null,
    ].filter(Boolean);

    // Emotional Intelligence ranked (desc by percentage)
    const erRanked = erCodes
      .map(code => {
        const item = surveyData.find(entry => entry.questionCode === code);
        return item ? { code, percentage: item.percentage } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.percentage - a.percentage);

    const erRank6 = erRanked[5]; // Rank 6
    const erRank5 = erRanked[4]; // Rank 5

    const emotionalRE = [
      erRank6 ? { code: erRank6.code, percentage: erRank6.percentage, recommendation: mapREText(erRank6.code) } : null,
      erRank5 ? { code: erRank5.code, percentage: erRank5.percentage, recommendation: mapREText(erRank5.code) } : null,
    ].filter(Boolean);

    // Set final ordered array
    setRecommendations([...leadershipRE, ...blindspotRE, ...emotionalRE]);
  }, [surveyData]);

  const mapREText = (code) => {
    switch (code) {
      case 'LTA': return recommendationDescriptions.recommendations[1].topics.join(', ');
      case 'LTB': return recommendationDescriptions.recommendations[6].topics.join(', ');
      case 'BSC': return recommendationDescriptions.recommendations[4].topics.join(', ');
      case 'BSD': return recommendationDescriptions.recommendations[2].topics.join(', ');
      case 'ER5': return recommendationDescriptions.recommendations[0].topics.join(', ');
      case 'ER3': return recommendationDescriptions.recommendations[7].topics.join(', ');
      default: return 'No recommendation found';
    }
  };

  return (
    <div className="strength-container">
      <h2>Recommendation Summary</h2>
      <table className="strength-table" aria-label="Recommendation Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map(({ code, percentage, recommendation }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RETable;
