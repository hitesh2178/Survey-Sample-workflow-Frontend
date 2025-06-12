import { useEffect, useState } from 'react';
import '../Styles/SurveyResponse.css';
import StrengthTable from '../components/strengthTable';
import BlindspotRankingTable from '../components/BlindspotRankingTable';
import EmotionalRankingTable from '../components/EmotionalRankingTable';
import WeaknessTable from '../components/WeaknessTable';

const SurveyResponse = () => {
  const [responses, setResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

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

    return localStorageData.answers.map((answer) => {
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

  const saveToLocalStorage = (data) => {
    try {
      // Create enhanced data structure with calculated values
      const enhancedData = {
        respondent_id: data[0]?.respondentId || '',
        answers: data.map(response => ({
          question_code: response.questionCode,
          spectrum: response.spectrum,
          range: response.range,
          question: response.question,
          selected_index: response.selectedOption,
          selected_text: response.selectedAnswer,
          options: response.options.map((text, index) => ({
            text,
            weight: response[`option${index + 1}`]
          })),
          // Add calculated values to the stored data
          calculated_values: {
            positive: response.positive,
            negative: response.negative,
            score: response.score,
            percentage: response.percentage
          }
        }))
      };

      localStorage.setItem('surveyResponses', JSON.stringify(enhancedData));
      console.log('Enhanced data saved to localStorage:', enhancedData);
    } catch (error) {
      console.error('Error saving enhanced data to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem('surveyResponses');
      if (storedData) {
        console.log('Raw localStorage data:', storedData);
        const parsedData = JSON.parse(storedData);
        console.log('Parsed data:', parsedData);
        
        // Check if data already has calculated values
        const hasCalculatedValues = parsedData.answers?.[0]?.calculated_values;
        
        let transformedData;
        if (hasCalculatedValues) {
          // Use existing calculated values if available
          transformedData = parsedData.answers.map((answer) => ({
            id: `${parsedData.respondent_id}_${answer.question_code}`,
            respondentId: parsedData.respondent_id.toString(),
            questionCode: answer.question_code,
            spectrum: answer.spectrum,
            range: answer.range,
            question: answer.question,
            selectedOption: answer.selected_index,
            selectedAnswer: answer.selected_text,
            options: answer.options.map(opt => opt.text),
            option1: answer.options[0]?.weight || 1,
            option2: answer.options[1]?.weight || 1,
            option3: answer.options[2]?.weight || 1,
            option4: answer.options[3]?.weight || 1,
            // Use stored calculated values
            positive: answer.calculated_values.positive,
            negative: answer.calculated_values.negative,
            score: answer.calculated_values.score,
            percentage: answer.calculated_values.percentage
          }));
        } else {
          // Calculate values for legacy data
          transformedData = transformLocalStorageData(parsedData);
          // Save the enhanced data back to localStorage
          saveToLocalStorage(transformedData);
        }
        
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
    const actualIndex = (currentPage - 1) * recordsPerPage + index;
    updatedResponses[actualIndex][key] = parseInt(value);
    const recalculated = calculateValues(updatedResponses[actualIndex]);
    updatedResponses[actualIndex] = recalculated;
    setResponses(updatedResponses);
    
    // Save updated data to localStorage
    saveToLocalStorage(updatedResponses);
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

  // Pagination logic
  const totalPages = Math.ceil(responses.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = responses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (newRecordsPerPage) => {
    setRecordsPerPage(newRecordsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <>
    <div className="survey-response-container">
      <div className="survey-response-card">
        <div className="survey-response-header">
          <h2 className="survey-response-title">Survey Response Analysis</h2>
          <p className="survey-response-subtitle">
            Detailed breakdown of survey responses and scoring
            <span style={{ 
              display: 'block', 
              marginTop: '5px', 
              color: '#d1d5db', 
              fontSize: '11px' 
            }}>
              Displaying {startIndex + 1}-{Math.min(endIndex, responses.length)} of {responses.length} responses
            </span>
          </p>
        </div>

        {responses.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📊</span>
            <p className="empty-state-text">No survey data found in localStorage</p>
          </div>
        ) : (
          <>
            {/* Records per page selector */}
            <div className="pagination-controls-top" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '10px',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ color: '#6b7280', fontSize: '13px' }}>Records per page:</label>
                <select 
                  value={recordsPerPage} 
                  onChange={(e) => handleRecordsPerPageChange(parseInt(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                </select>
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>

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
                  {currentRecords.map((res, index) => (
                    <tr key={res.id || index}>
                      <td style={{ fontSize: '11px', fontWeight: '600' }}>
                        {res.respondentId}
                      </td>
                      <td style={{ fontSize: '11px', fontWeight: '700', color: '#3730a3' }}>
                        {res.questionCode}
                      </td>
                      <td style={{ 
                        fontSize: '11px', 
                        maxWidth: '90px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {res.spectrum}
                      </td>
                      <td style={{ 
                        fontSize: '11px',
                        maxWidth: '70px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {res.range}
                      </td>
                      <td style={{ 
                        maxWidth: '180px', 
                        wordWrap: 'break-word',
                        fontSize: '11px',
                        lineHeight: '1.3'
                      }}>
                        {res.question}
                      </td>
                      <td style={{ 
                        maxWidth: '160px', 
                        wordWrap: 'break-word', 
                        fontSize: '10px',
                        backgroundColor: '#f0f9ff',
                        fontWeight: '500',
                        padding: '6px 4px'
                      }}>
                        {res.selectedAnswer && (
                          <div>
                            <span style={{ color: '#0369a1', fontWeight: 'bold', fontSize: '9px' }}>
                              Option {(res.selectedOption || 0) + 1}:
                            </span>
                            <br />
                            <span style={{ color: '#374151', fontSize: '10px' }}>
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
                              width: '45px',
                              padding: '2px',
                              borderRadius: '3px',
                              border: '1px solid #d1d5db',
                              fontSize: '11px'
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
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: '500',
                        fontSize: '11px'
                      }}>
                        {res.positive?.toFixed(1)}
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: '500',
                        fontSize: '11px'
                      }}>
                        {res.negative?.toFixed(1)}
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }} className={getScoreClass(res.score)}>
                        {res.score}
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold',
                        fontSize: '11px'
                      }} className={getPercentageClass(res.percentage)}>
                        {res.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                marginTop: '10px',
                padding: '10px 0'
              }}>
                <button 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  First
                </button>
                
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Previous
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      backgroundColor: currentPage === page ? '#3b82f6' : '#fff',
                      color: currentPage === page ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: currentPage === page ? 'bold' : 'normal'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Next
                </button>
                
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <div>
        {/* Pass the complete responses data with calculated values to StrengthTable */}
        <StrengthTable surveyData={responses} />
      </div>
      <div>
        {/* Pass the complete responses data with calculated values to StrengthTable */}
        <WeaknessTable surveyData={responses} />
      </div>
    <div>
        {/* Pass the complete responses data with calculated values to StrengthTable */}
        <BlindspotRankingTable surveyData={responses} />
      </div>
    <div>
        {/* Pass the complete responses data with calculated values to StrengthTable */}
        <EmotionalRankingTable surveyData={responses} />
      </div>
      </>
  );
};

export default SurveyResponse;