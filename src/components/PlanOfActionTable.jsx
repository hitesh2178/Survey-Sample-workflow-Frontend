import { useEffect, useState } from "react";
import "../Styles/strengthTable.css";
import interpretationData from "../Json/interpretations.json";

const PlanOfActionTable = ({ surveyData }) => {
  const [poaList, setPoaList] = useState([]);

  useEffect(() => {
    const getAveragePercentage = (codes) => {
      const relevant = surveyData.filter((item) =>
        codes.includes(item.questionCode)
      );
      const total = relevant.reduce(
        (sum, item) => sum + (item.percentage || 0),
        0
      );
      return relevant.length ? Math.round(total / relevant.length) : 0;
    };

    // Leadership POA
    const leadershipGroups = {
      LTA: ["LT1", "LT2", "LT3", "LT4", "LT5", "LT6", "LT7"],
      LTB: ["LT8", "LT9", "LT10", "LT11", "LT12", "LT13", "LT14"],
    };

    const leadershipPOAs = Object.entries(leadershipGroups).map(
      ([code, codes]) => {
        const percentage = getAveragePercentage(codes);
        const entry = interpretationData.leadership_interpretations.find(
          (item) => item.code === code
        );
        return {
          code,
          percentage,
          poa: entry?.poa || "No POA found",
        };
      }
    );

    // Blindspot POA
    const blindspotGroups = {
      BSA: ["BS1", "BS2", "BS3"],
      BSB: ["BS4", "BS5", "BS6"],
      BSC: ["BS7", "BS8", "BS9"],
      BSD: ["BS10", "BS11", "BS12"],
      BSE: ["BS13", "BS14", "BS15"],
    };

    const blindspotRanked = Object.entries(blindspotGroups)
      .map(([code, codes]) => ({
        code,
        percentage: getAveragePercentage(codes),
      }))
      .sort((a, b) => b.percentage - a.percentage); // descending

    // Select rank 3 and rank 2 for blindspot: indices 2 and 1
    const blindspotSelected = [blindspotRanked[2], blindspotRanked[1]]
      .filter(Boolean)
      .map(({ code, percentage }) => ({
        code,
        percentage,
        poa:
          interpretationData.blindspot_interpretations?.areas_of_improvement?.[
            code
          ]?.poa || "No POA found",
      }));

    // Emotional Intelligence POA
    const erDataSorted = surveyData
      .filter((item) => item.questionCode.startsWith("ER"))
      .sort((a, b) => b.percentage - a.percentage);

    const erDataWithRank = erDataSorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // Find items with rank 4, 3, 2 in that order
    const targetRanks = [4, 3, 2];
    const erSelected = targetRanks
      .map((rank) => erDataWithRank.find((item) => item.rank === rank))
      .filter(Boolean)
      .map((item) => {
        const poa =
          interpretationData.emotional_intelligence_interpretations
            ?.areas_of_improvement?.[item.questionCode]?.plan_of_action ||
          "No POA found";

        return {
          code: item.questionCode,
          percentage: item.percentage,
          poa,
        };
      });

    setPoaList([...leadershipPOAs, ...blindspotSelected, ...erSelected]);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Plan of Action (POA)</h2>
      <table className="strength-table" aria-label="Plan of Action Table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Percentage</th>
            <th>Plan of Action</th>
          </tr>
        </thead>
        <tbody>
          {poaList.map(({ code, percentage, poa }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td>{poa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanOfActionTable;
