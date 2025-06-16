import { useEffect, useState } from "react";
import "../Styles/strengthTable.css";
import interpretations from "../Json/interpretations.json";

const WeaknessTable = ({ surveyData }) => {
  const [weaknesses, setWeaknesses] = useState([]);

  const getAveragePercentage = (codes) => {
    const filtered = surveyData.filter((item) =>
      codes.includes(item.questionCode)
    );
    if (!filtered.length) return 0;
    const sum = filtered.reduce((acc, cur) => acc + (cur.percentage || 0), 0);
    return Math.round(sum / filtered.length);
  };

  const getWeaknessText = (code) => {
    // Leadership weaknesses
    if (interpretations.leadership_interpretations) {
      const leaderEntry = interpretations.leadership_interpretations.find(
        (item) => item.code === code
      );
      if (leaderEntry)
        return leaderEntry.weakness || "No description available";
    }

    // Blindspot weaknesses
    if (interpretations.blindspot_interpretations?.weaknesses) {
      if (interpretations.blindspot_interpretations.weaknesses[code]) {
        return interpretations.blindspot_interpretations.weaknesses[code];
      }
    }

    // Emotional Intelligence weaknesses
    if (
      interpretations.emotional_intelligence_interpretations?.weaknesses &&
      interpretations.emotional_intelligence_interpretations.weaknesses[code]
    ) {
      return interpretations.emotional_intelligence_interpretations.weaknesses[
        code
      ];
    }

    return "No description available";
  };

  useEffect(() => {
    const leadershipGroups = {
      LTA: ["LT1", "LT2", "LT3", "LT4", "LT5"],
      LTB: ["LT6", "LT7", "LT8", "LT9", "LT10"],
    };

    const blindspotGroups = {
      BSA: ["BS1", "BS2", "BS3"],
      BSB: ["BS4", "BS5", "BS6"],
      BSC: ["BS7", "BS8", "BS9"],
      BSD: ["BS10", "BS11", "BS12"],
      BSE: ["BS13", "BS14", "BS15"],
    };

    // Leadership: LTA, LTB only
    const leadershipWeaknesses = ["LTA", "LTB"].map((code) => ({
      code,
      percentage: getAveragePercentage(leadershipGroups[code]),
      weakness: getWeaknessText(code),
    }));

    // Blindspot: calculate & sort desc by percentage
    const blindspotWeaknesses = Object.entries(blindspotGroups)
      .map(([code, codes]) => ({
        code,
        percentage: getAveragePercentage(codes),
        weakness: getWeaknessText(code),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const blindspotRank4 = blindspotWeaknesses[3] || null;
    const blindspotRank5 = blindspotWeaknesses[4] || null;

    // Emotional Intelligence: get all ER questions, sort desc by percentage
    const emotionalData = surveyData.filter((item) =>
      item.questionCode.startsWith("ER")
    );
    const sortedER = emotionalData.sort((a, b) => b.percentage - a.percentage);

    const erRank5 = sortedER[4] || null; // 5th highest
    const erRank6 = sortedER[5] || null; // 6th highest

    const emotionalWeaknesses = [erRank6, erRank5]
      .filter(Boolean)
      .map((item) => ({
        code: item.questionCode,
        percentage: item.percentage,
        weakness: getWeaknessText(item.questionCode),
      }));

    // Combine all selected weaknesses (no notes column now)
    const combined = [
      ...leadershipWeaknesses,
      blindspotRank5,
      blindspotRank4,
      ...emotionalWeaknesses,
    ].filter(Boolean);

    setWeaknesses(combined);
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
              <td>
                {typeof weakness === "string" ? (
                  weakness
                ) : weakness && typeof weakness === "object" ? (
                  <>
                    <div>{weakness.text || "No description available"}</div>
                    {weakness.recommendation &&
                      weakness.recommendation.length > 0 && (
                        <ul style={{ marginTop: 4 }}>
                          {weakness.recommendation.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      )}
                  </>
                ) : (
                  "No description available"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <em>
          Interpretations based on Leadership, Blindspot, and Emotional
          Intelligence weaknesses.
        </em>
      </p>
    </div>
  );
};

export default WeaknessTable;
