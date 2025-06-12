import { useEffect, useState } from 'react';
import '../Styles/SurveyResponse.css';

const SurveyResponse = () => {
  const [responses, setResponses] = useState([]);

  const calculateValues = (res) => {
    const positive = (0.6 * res.option1) + (0.4 * res.option2);
    const negative = (0.6 * res.option4) + (0.4 * res.option3);
    const score = Math.round((positive - negative) * 10) / 10;
    const percentage = Math.round(((score / 6) + 0.5) * 100);
    return { ...res, positive, negative, score, percentage };
  };

  const transformLocalStorageData = (localStorageData) => {
    if (!localStorageData || !localStorageData.answers) {
      return [];
    }

    // eslint-disable-next-line no-unused-vars
    return localStorageData.answers.map((answer, index) => {
      // Create the base response object
      const baseResponse = {
        id: `${localStorageData.respondent_id}_${answer.question_code}`,
        respondentId: localStorageData.respondent_id.toString(),
        questionCode: answer.question_code,
        spectrum: answer.spectrum,
        range: answer.range,
        question: answer.question,
        selectedOption: answer.selected_index,
        selectedAnswer: answer.selected_text,
        options: answer.options.map(opt => opt.text),
        // Set option weights from the options array
        option1: answer.options[0]?.weight || 1,
        option2: answer.options[1]?.weight || 1,
        option3: answer.options[2]?.weight || 1,
        option4: answer.options[3]?.weight || 1
      };

      // Calculate positive, negative, score, and percentage
      return calculateValues(baseResponse);
    });
  };

  const loadFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem('surveyResponses');
      if (storedData) {
        console.log('Raw localStorage data:', storedData);
        const parsedData = JSON.parse(storedData);
        console.log('Parsed data:', parsedData);
        const transformedData = transformLocalStorageData(parsedData);
        console.log('Transformed data:', transformedData);
        setResponses(transformedData);
      } else {
        console.log('No survey response data found in localStorage');
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading survey response data from localStorage:', error);
      setResponses([]);
    }
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const handleOptionChange = (index, key, value) => {
    const updatedResponses = [...responses];
    updatedResponses[index][key] = parseInt(value);
    const recalculated = calculateValues(updatedResponses[index]);
    updatedResponses[index] = recalculated;
    setResponses(updatedResponses);
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 80) return 'percentage-high';
    if (percentage >= 60) return 'percentage-good';
    if (percentage >= 40) return 'percentage-medium';
    return 'percentage-low';
  };

  const getScoreClass = (score) => {
    if (score >= 2.5) return 'score-high';
    if (score >= 1.5) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="survey-response-container">
      <div className="survey-response-card">
        <div className="survey-response-header">
          <h2 className="survey-response-title">Survey Response Analysis</h2>
          <p className="survey-response-subtitle">Detailed breakdown of survey responses and scoring</p>
          <div style={{ marginTop: '10px' }}>
            <small style={{ color: '#d1d5db', fontSize: '12px' }}>
              Displaying {responses.length} survey responses
            </small>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📊</span>
            <p className="empty-state-text">No survey data found in localStorage</p>
          </div>
        ) : (
          <div className="survey-response-table-container">
            <table className="survey-response-table">
              <thead>
                <tr>
                  <th>Respondent ID</th>
                  <th>Question Code</th>
                  <th>Spectrum</th>
                  <th>Range</th>
                  <th>Question</th>
                  <th>Selected Answer</th>
                  <th>Option 1</th>
                  <th>Option 2</th>
                  <th>Option 3</th>
                  <th>Option 4</th>
                  <th>Positive</th>
                  <th>Negative</th>
                  <th>Score</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((res, index) => (
                  <tr key={res.id || index}>
                    <td>{res.respondentId}</td>
                    <td>{res.questionCode}</td>
                    <td>{res.spectrum}</td>
                    <td>{res.range}</td>
                    <td style={{ maxWidth: '250px', wordWrap: 'break-word' }}>
                      {res.question}
                    </td>
                    <td style={{ 
                      maxWidth: '300px', 
                      wordWrap: 'break-word', 
                      fontSize: '12px',
                      backgroundColor: '#f0f9ff',
                      fontWeight: '500'
                    }}>
                      {res.selectedAnswer && (
                        <div>
                          <span style={{ color: '#0369a1', fontWeight: 'bold' }}>
                            Option {(res.selectedOption || 0) + 1}:
                          </span>
                          <br />
                          <span style={{ color: '#374151' }}>
                            {res.selectedAnswer}
                          </span>
                        </div>
                      )}
                    </td>
                    {[1, 2, 3, 4].map((opt) => (
                      <td key={opt} style={{ textAlign: 'center' }}>
                        <select
                          value={res[`option${opt}`]}
                          onChange={(e) =>
                            handleOptionChange(index, `option${opt}`, e.target.value)
                          }
                          style={{
                            width: '60px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db'
                          }}
                        >
                          {[1, 2, 3, 4].map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {res.positive?.toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '500' }}>
                      {res.negative?.toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }} className={getScoreClass(res.score)}>
                      {res.score}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }} className={getPercentageClass(res.percentage)}>
                      {res.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponse;