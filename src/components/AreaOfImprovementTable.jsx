import { useEffect, useState } from "react";
import "../Styles/strengthTable.css";
import aoiData from "../Json/aoi.json";

// Map survey codes or rank codes to AOI interpretation IDs from your JSON
const codeToAOIId = {
  LTA: 2, // Leadership AOI for LTA
  LTB: 7, // Leadership AOI for LTB
  BSE: 5, // Blindspot AOI code (rank 3)
  BSA: 6, // Blindspot AOI code (rank 2)
  ER4: 3, // EI AOI rank 4
  ER1: 4, // EI AOI rank 3
  ER6: 1, // EI AOI rank 2
};

const AreaOfImprovementTable = ({ surveyData }) => {
  const [aoiList, setAoiList] = useState([]);

  useEffect(() => {
    // Calculate average percentage for an array of question codes
    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter((item) =>
        codes.includes(item.questionCode)
      );
      const total = filtered.reduce(
        (sum, item) => sum + (item.percentage || 0),
        0
      );
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    // Get AOI text from aoi.json using codeToAOIId mapping
    const findAOIText = (code) => {
      const aoiId = codeToAOIId[code];
      if (!aoiId) return "No AOI description available";
      const aoiObj = aoiData.areas_of_improvement.find(
        (item) => item.id === aoiId
      );
      return aoiObj ? aoiObj.text : "No AOI description available";
    };

    // Leadership question groups (codes from your survey)
    const leadershipGroups = {
      LTA: ["LT1", "LT2", "LT3", "LT4", "LT5", "LT6", "LT7"],
      LTB: ["LT8", "LT9", "LT10", "LT11", "LT12", "LT13", "LT14"],
    };

    const leadershipAOI = Object.entries(leadershipGroups).map(
      ([code, codes]) => {
        const avg = getAveragePercentage(codes);
        const aoiText = findAOIText(code);
        return { code, percentage: avg, aoi: aoiText };
      }
    );

    // Blindspot question groups
    const bsGroups = {
      BSA: ["BS1", "BS2", "BS3"],
      BSB: ["BS4", "BS5", "BS6"],
      BSC: ["BS7", "BS8", "BS9"],
      BSD: ["BS10", "BS11", "BS12"],
      BSE: ["BS13", "BS14", "BS15"],
    };

    // Compute average percentages and sort descending by percentage
    const bsRankings = Object.entries(bsGroups)
      .map(([code, codes]) => ({
        code,
        percentage: getAveragePercentage(codes),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Pick Blindspot ranks 3 and 2 (3rd and 2nd highest)
    // Note: zero-based index so rank 3 is index 2, rank 2 is index 1
    const blindspotAOI = [bsRankings[2], bsRankings[1]]
      .filter(Boolean)
      .map((bs) => ({
        code: bs.code,
        percentage: bs.percentage,
        aoi: findAOIText(bs.code),
      }));

    // Emotional Intelligence (ER) data
    const erData = surveyData.filter((item) =>
      item.questionCode.startsWith("ER")
    );

    // Sort ER data descending by percentage
    const erRankings = erData.sort((a, b) => b.percentage - a.percentage);

    // Pick ranks 4, 3, and 2 (indexes 3, 2, 1 respectively)
    const emotionalAOI = [erRankings[3], erRankings[2], erRankings[1]]
      .filter(Boolean)
      .map((er) => ({
        code: er.questionCode,
        percentage: er.percentage,
        aoi: findAOIText(er.questionCode),
      }));

    // Combine all AOI entries
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
