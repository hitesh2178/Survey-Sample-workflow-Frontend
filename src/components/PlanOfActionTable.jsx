import { useEffect, useState } from 'react';
import poaDescriptions from '../Json/poa.json';
import eiDescriptions from '../Json/EI.json';
import '../Styles/StrengthTable.css';  // Reuse Strength Table CSS

const POATable = ({ surveyData }) => {
  const [poaList, setPoaList] = useState([]);

  useEffect(() => {
    // Helper: calculate average percentage for given question codes
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter(item => codes.includes(item.questionCode));
      if (!filtered.length) return 0;
      const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
      return Math.round(total / filtered.length);
    };

    // Get POA text by poa id
    const getPoaText = (id) => {
      const found = poaDescriptions.poa.find(item => item.id === id);
      return found ? found.text : 'No description available.';
    };

    // Get Emotional Intelligence POA text by question code
    const getEiPoaText = (code) => {
      const found = eiDescriptions.emotional_intelligence.find(item => item.questionCode === code);
      return found ? found.strength : 'No EI description available.';
    };

    // Leadership question codes groups
    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5', 'LT6', 'LT7'],
      LTB: ['LT8', 'LT9', 'LT10', 'LT11', 'LT12', 'LT13', 'LT14'],
    };

    // Compute leadership POA entries
    const leadershipPoa = Object.entries(leadershipGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      const poaIdMap = { LTA: 2, LTB: 7 }; // From your POA JSON ids
      return {
        code,
        percentage: avg,
        poa: getPoaText(poaIdMap[code]),
      };
    });

    // Blindspot question codes groups
    const bsGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    // Calculate average blindspot percentages
    const bsRankings = Object.entries(bsGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      return { code, percentage: avg };
    });

    // Sort blindspot descending by percentage
    const sortedBS = bsRankings.sort((a, b) => b.percentage - a.percentage);

    // Pick rank 3 and 2 for POA, map to POA IDs from your JSON (example mapping)
    const blindspotPoaEntries = [sortedBS[2], sortedBS[1]]
      .filter(Boolean)
      .map(bs => {
        const poaIdMap = { BSA: 9, BSB: 10, BSE: 5 }; // Adjust as per your POA JSON mapping
        return {
          code: bs.code,
          percentage: bs.percentage,
          poa: getPoaText(poaIdMap[bs.code] || null),
        };
      });

    // Emotional Intelligence (ER) entries from surveyData
    const erData = surveyData.filter(item => item.questionCode.startsWith('ER'));
    const sortedER = erData.sort((a, b) => b.percentage - a.percentage);

    // Pick rank 4, 3, and 2 for POA
    const eiRanks = [sortedER[3], sortedER[2], sortedER[1]].filter(Boolean);

    // Build EI POA list from EI JSON file's strength text
    const emotionalIntelligencePoa = eiRanks.map(er => ({
      code: er.questionCode,
      percentage: er.percentage,
      poa: getEiPoaText(er.questionCode),
    }));

    // Combine all POA entries
    const combinedPoa = [...leadershipPoa, ...blindspotPoaEntries, ...emotionalIntelligencePoa];

    setPoaList(combinedPoa);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Plan of Action Summary</h2>
      <table className="strength-table" aria-label="Plan of Action Summary Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Plan of Action</th>
          </tr>
        </thead>
        <tbody>
          {poaList.map(({ code, percentage, poa }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td style={{ whiteSpace: 'pre-line' }}>{poa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default POATable;
