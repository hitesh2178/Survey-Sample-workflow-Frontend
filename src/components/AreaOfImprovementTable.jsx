import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css';
import aoiData from '../Json/aoi.json';

const codeToAOIId = {
  LTA: 2,
  LTB: 7,
  BSE: 5,
  BSA: 6,
  ER4: 3,
  ER1: 4,
  ER6: 1,
};

const AreaOfImprovementTable = ({ surveyData }) => {
  const [aoiList, setAoiList] = useState([]);

  useEffect(() => {
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter(item => codes.includes(item.questionCode));
      const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    const findAOIText = (code) => {
      const aoiId = codeToAOIId[code];
      if (!aoiId) return 'No AOI description';
      const aoiObj = aoiData.areas_of_improvement.find(item => item.id === aoiId);
      return aoiObj ? aoiObj.text : 'No AOI description';
    };

    // Leadership groups
    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7'],
      LTB: ['LT8', 'LT9', 'LT10', 'LT11', 'LT12', 'LT13', 'LT14'],
    };

    const leadershipAOI = Object.entries(leadershipGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      const aoiText = findAOIText(code);
      return { code, percentage: avg, aoi: aoiText };
    });

    // Blindspot groups
    const bsGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    const bsRankings = Object.entries(bsGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      return { code, percentage: avg };
    }).sort((a, b) => b.percentage - a.percentage);

    // Pick ranks 3 and 2 (index 2 and 1)
    const blindspotAOI = [bsRankings[2], bsRankings[1]].map(bs => {
      if (!bs) return null;
      const aoiText = findAOIText(bs.code);
      return { code: bs.code, percentage: bs.percentage, aoi: aoiText };
    }).filter(Boolean);

    // Emotional Intelligence AOI
    const erData = surveyData.filter(item => item.questionCode.startsWith('ER'));
    const erRankings = erData.sort((a, b) => b.percentage - a.percentage);

    // Pick ranks 4, 3, 2 (indexes 3, 2, 1)
    const emotionalAOI = [erRankings[3], erRankings[2], erRankings[1]].map(er => {
      if (!er) return null;
      const aoiText = findAOIText(er.questionCode);
      return { code: er.questionCode, percentage: er.percentage, aoi: aoiText };
    }).filter(Boolean);

    setAoiList([...leadershipAOI, ...blindspotAOI, ...emotionalAOI]);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Areas of Improvement</h2>
      <table className="strength-table" aria-label="Areas of Improvement Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Area of Improvement</th>
          </tr>
        </thead>
        <tbody>
          {aoiList.map(({ code, percentage, aoi }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{aoi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AreaOfImprovementTable;
