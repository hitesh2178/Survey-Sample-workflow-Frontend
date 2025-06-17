import { useEffect, useState } from "react";
import "../Styles/strengthTable.css";
import interpretationData from "../Json/interpretations.json";

const RecommendationTable = ({ surveyData }) => {
  const [reList, setReList] = useState([]);

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

    // 1. Leadership Recommendations
    const leadershipGroups = {
      LTA: ["LT1", "LT2", "LT3", "LT4", "LT5", "LT6", "LT7"],
      LTB: ["LT8", "LT9", "LT10", "LT11", "LT12", "LT13", "LT14"],
    };

    const leadershipREs = Object.entries(leadershipGroups).map(
      ([code, codes]) => {
        const percentage = getAveragePercentage(codes);
        const entry = interpretationData.leadership_interpretations.find(
          (item) => item.code === code
        );
        return {
          code,
          percentage,
          recommendation:
            entry?.recommendation?.join("\n") || "No Recommendation found",
        };
      }
    );

    // 2. Blindspot Recommendations (Bottom 2 performers)
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
      .sort((a, b) => b.percentage - a.percentage); // descending order

    const blindspotSelected = [blindspotRanked[4], blindspotRanked[3]]
      .filter(Boolean)
      .map(({ code, percentage }) => {
        const recs =
          interpretationData.blindspot_interpretations?.weaknesses?.[code]
            ?.recommendation;

        return {
          code,
          percentage,
          recommendation: Array.isArray(recs)
            ? recs.join("\n")
            : recs || "No Recommendation found",
        };
      });

    // 3. Emotional Intelligence Recommendations (Bottom 2 from Top 6)
    const erDataSorted = surveyData
      .filter((item) => item.questionCode.startsWith("ER"))
      .sort((a, b) => b.percentage - a.percentage);

    const erDataWithRank = erDataSorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    const targetRanks = [6, 5];
    const erSelected = targetRanks
      .map((rank) => erDataWithRank.find((item) => item.rank === rank))
      .filter(Boolean)
      .map((item) => {
        const recs =
          interpretationData.emotional_intelligence_interpretations
            ?.weaknesses?.[item.questionCode]?.recommendation;

        return {
          code: item.questionCode,
          percentage: item.percentage,
          recommendation: Array.isArray(recs)
            ? recs.join("\n")
            : recs || "No Recommendation found",
        };
      });

    setReList([...leadershipREs, ...blindspotSelected, ...erSelected]);
  }, [surveyData]);

  return (
    <div className="strength-container">
      <h2>Recommendation (RE) Table</h2>
      <table className="strength-table" aria-label="Recommendation Table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Percentage</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {reList.map(({ code, percentage, recommendation }) => (
            <tr key={code}>
              <td>{code}</td>
              <td>{percentage}%</td>
              <td style={{ whiteSpace: "pre-wrap" }}>{recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecommendationTable;
