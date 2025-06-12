import { useState, useEffect } from 'react';
import '../Styles/strengthTable.css';
import strengthJson from '../Json/strength.json';

const StrengthTable = ({ surveyData }) => {
  const [strengths, setStrengths] = useState([]);

  const strengthTextById = (id) => {
    const match = strengthJson.strengths.find(s => s.id === id);
    return match ? match.text : 'No matching strength';
  };

  const strengthMapping = {
    LTA: [
      { min: 80, max: 100, strengthId: 1 },
      { min: 60, max: 79.99, strengthId: 2 },
      { min: 40, max: 59.99, strengthId: 3 },
      { min: 20, max: 39.99, strengthId: 4 },
      { min: 0,  max: 19.99, strengthId: 5 }
    ],
    LTB: [
      { min: 80, max: 100, strengthId: 6 },
      { min: 60, max: 79.99, strengthId: 7 },
      { min: 40, max: 59.99, strengthId: 8 },
      { min: 20, max: 39.99, strengthId: 9 },
      { min: 0,  max: 19.99, strengthId: 10 }
    ]
  };

  useEffect(() => {
    if (!surveyData || surveyData.length === 0) return;

    const calculateAvg = (start, end) => {
      const filtered = surveyData.filter(item => {
        const num = parseInt(item.questionCode.replace('LT', ''), 10);
        return num >= start && num <= end;
      });

      if (filtered.length === 0) return 0;

      const total = filtered.reduce((sum, q) => sum + q.percentage, 0);
      return total / filtered.length;
    };

    const getStrengthByAvg = (code, avg) => {
      const mapping = strengthMapping[code];
      const matched = mapping.find(m => avg >= m.min && avg <= m.max);
      return matched ? strengthTextById(matched.strengthId) : 'No strength found';
    };

    const avgLTA = calculateAvg(1, 7);
    const avgLTB = calculateAvg(8, 14);

    const strengthLTA = getStrengthByAvg('LTA', avgLTA);
    const strengthLTB = getStrengthByAvg('LTB', avgLTB);

    setStrengths([
      { code: 'LTA', percentage: avgLTA.toFixed(2), strength: strengthLTA },
      { code: 'LTB', percentage: avgLTB.toFixed(2), strength: strengthLTB }
    ]);
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
