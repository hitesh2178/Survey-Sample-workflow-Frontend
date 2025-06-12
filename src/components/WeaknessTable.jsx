import { useEffect, useState } from 'react';
import '../Styles/strengthTable.css'; // reuse or create your own WeaknessTable.css if you want
import weaknessDescriptions from '../Json/weakness.json'; // Your weakness descriptions JSON

const WeaknessTable = ({ surveyData }) => {
  const [weaknesses, setWeaknesses] = useState([]);

  // Helper: get average percentage for a group of question codes
  const getAveragePercentage = (codes) => {
    const filtered = surveyData.filter(item => codes.includes(item.questionCode));
    const total = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
    return filtered.length ? Math.round(total / filtered.length) : 0;
  };

  // Helper: Get weakness text by matching id or code to weaknessDescriptions JSON
  // You may need to adjust this based on how weaknesses are stored in your JSON
  const getWeaknessTextById = (id) => {
    const found = weaknessDescriptions.weaknesses.find(w => w.id === id);
    return found ? found.text : 'No description available';
  };

  useEffect(() => {
    // 1. Leadership Weakness groups & averages
    const leadershipGroups = {
      LTA: ['LT1', 'LT2', 'LT3', 'LT4', 'LT5'],
      LTB: ['LT6', 'LT7', 'LT8', 'LT9', 'LT10'],
    };

    // Map Leadership weaknesses with avg % and weakness text from weaknesses.json by id (example: map LTA->id 2, LTB->id7)
    // Adjust these IDs according to your actual mapping in weakness.json
    const leadershipWeaknessMap = {
      LTA: 2, // weakness id 2 from weakness.json
      LTB: 7, // weakness id 7
    };

    const leadershipWeaknesses = Object.entries(leadershipGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      const weaknessId = leadershipWeaknessMap[code];
      const weaknessText = getWeaknessTextById(weaknessId);
      return { code, percentage: avg, weakness: weaknessText };
    });

    // 2. Blindspot groups & ranking
    const bsGroups = {
      BSA: ['BS1', 'BS2', 'BS3'],
      BSB: ['BS4', 'BS5', 'BS6'],
      BSC: ['BS7', 'BS8', 'BS9'],
      BSD: ['BS10', 'BS11', 'BS12'],
      BSE: ['BS13', 'BS14', 'BS15'],
    };

    // Map Blindspot codes to weakness IDs in your JSON (example)
    const blindspotWeaknessMap = {
      BSA: 1,
      BSB: 3,
      BSC: 9,  // Example: BSC maps to weakness id 9 in weakness.json
      BSD: 10,
      BSE: 5,
    };

    const bsRankings = Object.entries(bsGroups).map(([code, codes]) => {
      const avg = getAveragePercentage(codes);
      return { code, percentage: avg };
    });

    // Sort Blindspot descending by percentage and get 4th and 5th ranks (assuming ranks start from highest=1)
    const sortedBS = bsRankings.sort((a, b) => b.percentage - a.percentage);
    const bsRank4 = sortedBS[3]; // 4th highest
    const bsRank5 = sortedBS[4]; // 5th highest

    // Get weakness text for Blindspot ranks
    const bsWeakness4 = bsRank4 ? getWeaknessTextById(blindspotWeaknessMap[bsRank4.code]) : 'No data';
    const bsWeakness5 = bsRank5 ? getWeaknessTextById(blindspotWeaknessMap[bsRank5.code]) : 'No data';

    // 3. Emotional Intelligence data filtered & ranked
    const erData = surveyData.filter(item => item.questionCode.startsWith('ER'));
    const sortedER = erData.sort((a, b) => b.percentage - a.percentage);
    // Example: Map ER codes to weakness IDs (adjust as per your JSON)
    const emotionalWeaknessMap = {
      ER3: 3,
      ER5: 6,
      // Add others if needed
    };

    const erRank5 = sortedER[4]; // 5th highest
    const erRank6 = sortedER[5]; // 6th highest

    const erWeakness5 = erRank5 ? getWeaknessTextById(emotionalWeaknessMap[erRank5.questionCode]) : 'No data';
    const erWeakness6 = erRank6 ? getWeaknessTextById(emotionalWeaknessMap[erRank6.questionCode]) : 'No data';

    // Combine final weaknesses list
    const allWeaknesses = [
      ...leadershipWeaknesses,
      bsRank5 ? { code: bsRank5.code, percentage: bsRank5.percentage, weakness: bsWeakness5 } : null,
      bsRank4 ? { code: bsRank4.code, percentage: bsRank4.percentage, weakness: bsWeakness4 } : null,
      erRank6 ? { code: erRank6.questionCode, percentage: erRank6.percentage, weakness: erWeakness6 } : null,
      erRank5 ? { code: erRank5.questionCode, percentage: erRank5.percentage, weakness: erWeakness5 } : null,
    ].filter(Boolean);

    setWeaknesses(allWeaknesses);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Weakness Summary</h2>
      <table className="strength-table" aria-label="Weakness Summary Table">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Percentage</th>
            <th scope="col">Weakness</th>
          </tr>
        </thead>
        <tbody>
          {weaknesses.map(({ code, percentage, weakness }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{weakness}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p><em>Interpretations based on Leadership, Blindspot, and Emotional Intelligence Weaknesses.</em></p>
    </div>
  );
};

export default WeaknessTable;
