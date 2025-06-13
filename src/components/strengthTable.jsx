import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css';
import strengthDescriptions from '../Json/strength.json';

const StrengthTable = ({ surveyData }) => {
  const [strengths, setStrengths] = useState([]);

  useEffect(() => {
    // Calculate average percentage for a given array of question codes
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter(item => codes.includes(item.questionCode));
      const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    // Map percentage to descriptive strength text from JSON
    const getStrengthText = (percentage) => {
      if (percentage >= 90) return strengthDescriptions.strengths[0].text;
      if (percentage >= 80) return strengthDescriptions.strengths[1].text;
      if (percentage >= 70) return strengthDescriptions.strengths[2].text;
      if (percentage >= 60) return strengthDescriptions.strengths[3].text;
      return strengthDescriptions.strengths[4].text;
    };

    // Leadership groups based on updated excel data
    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7'],
      LTB: ['LT8', 'LT9', 'LT10', 'LT11', 'LT12', 'LT13', 'LT14'],
    };

    // Compute leadership strengths
    const leadershipStrengths = Object.entries(leadershipGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      return {
        code,
        percentage: avg,
        strength: getStrengthText(avg),
      };
    });

    // Blindspot groups
    const bsGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    // Compute Blindspot rankings & get top 1
    const bsRankings = Object.entries(bsGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      return { code, percentage: avg };
    });
    const sortedBS = bsRankings.sort((a, b) => b.percentage - a.percentage);
    const topBS = sortedBS[0];
    const bsStrength = topBS ? getStrengthText(topBS.percentage) : 'No data';

    // Emotional Intelligence data (filter ER codes)
    const erData = surveyData.filter(item => item.questionCode.startsWith('ER'));
    const sortedER = erData.sort((a, b) => b.percentage - a.percentage);
    const topER = sortedER[0];
    const erStrength = topER ? getStrengthText(topER.percentage) : 'No data';

    // Combine all strengths
    const allStrengths = [
      ...leadershipStrengths,
      topBS ? { code: topBS.code, percentage: topBS.percentage, strength: bsStrength } : null,
      topER ? { code: topER.questionCode, percentage: topER.percentage, strength: erStrength } : null,
    ].filter(Boolean); // filter out any nulls

    setStrengths(allStrengths);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Strength Summary</h2>
      <table className="strength-table" aria-label="Strength Summary Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Strength</th>
          </tr>
        </thead>
        <tbody>
          {strengths.map(({ code, percentage, strength }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{strength}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StrengthTable;
