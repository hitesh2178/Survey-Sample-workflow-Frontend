import { useEffect, useState } from "react";
import interpretations from "../Json/interpretations.json";
import "../Styles/strengthTable.css";

const StrengthTable = ({ surveyData }) => {
  const [strengths, setStrengths] = useState([]);

  useEffect(() => {
    if (!surveyData || surveyData.length === 0) return;

    const getAveragePercentage = (codes) => {
      const filtered = surveyData.filter((item) =>
        codes.includes(item.questionCode)
      );
      const total = filtered.reduce(
        (acc, cur) => acc + (cur.percentage || 0),
        0
      );
      return filtered.length ? Math.round(total / filtered.length) : 0;
    };

    // ------------------- Leadership Strengths -------------------
    const leadershipGroups = {
      LTA: ["LT1", "LT2", "LT3", "LT4", "LT5", "LT6", "LT7"],
      LTB: ["LT8", "LT9", "LT10", "LT11", "LT12", "LT13", "LT14"],
    };

    const leadershipStrengths = Object.entries(leadershipGroups).map(
      ([code, codes]) => {
        const avg = getAveragePercentage(codes);
        const match = interpretations.leadership_interpretations.find(
          (entry) => {
            if (entry.code !== code) return false;
            const [high, low] = entry.range.split("-").map(Number);
            return avg <= high && avg >= low;
          }
        );

        return {
          code,
          percentage: avg,
          strength: match?.strength || "No strength interpretation found",
        };
      }
    );

    // ------------------- Blindspot Strength (Top Rank) -------------------
    const bsGroups = {
      BSA: ["BS1", "BS2", "BS3"],
      BSB: ["BS4", "BS5", "BS6"],
      BSC: ["BS7", "BS8", "BS9"],
      BSD: ["BS10", "BS11", "BS12"],
      BSE: ["BS13", "BS14", "BS15"],
    };

    const bsRanked = Object.entries(bsGroups)
      .map(([code, codes]) => {
        const avg = getAveragePercentage(codes);
        return { code, percentage: avg };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const topBS = bsRanked[0];
    const bsStrength = {
      code: topBS.code,
      percentage: topBS.percentage,
      strength:
        interpretations.blindspot_interpretations.strengths[topBS.code] ||
        "No strength interpretation found",
    };

    // ------------------- Emotional Intelligence Strength (Top Rank) -------------------
    const erItems = surveyData.filter((item) =>
      item.questionCode.startsWith("ER")
    );
    const sortedER = [...erItems].sort((a, b) => b.percentage - a.percentage);
    const topER = sortedER[0];

    const erStrength = {
      code: topER?.questionCode || "N/A",
      percentage: topER?.percentage || 0,
      strength:
        interpretations.emotional_intelligence_interpretations.strengths[
          topER?.questionCode
        ] || "No strength interpretation found",
    };

    // ------------------- Final Strength List -------------------
    const allStrengths = [...leadershipStrengths, bsStrength, erStrength];
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
