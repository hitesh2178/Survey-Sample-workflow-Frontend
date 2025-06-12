import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from '../Json/question_options.json';
import '../Styles/Survey.css';

const Survey = () => {
  const navigate = useNavigate();
  const questions = questionsData.assessment_data;

  // State for survey progress and answers
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // State for respondent info form
  const [respondentInfo, setRespondentInfo] = useState({
    fullName: '',
    email: '',
    gender: '',
    dob: '',
    company: '',
    location: '',
    tenure: '',
    tenureManager: '',
  });

  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Generate random 6-digit respondent ID on every render (could be improved to persist on session)
  const respondentId = Math.floor(100000 + Math.random() * 900000);

  const currentQuestion = questions[currentIndex];

  // Handle answer selection per question
  const handleOptionSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.code]: optionIndex,
    }));
  };

  // Navigate to next or previous question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  // Update respondent info form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRespondentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start survey after respondent info filled
  const handleStartSurvey = () => {
    setShowIntro(false);
  };

  // Submit survey responses
  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);

    const responseData = questions.map((q) => {
      const selectedIndex = answers[q.code];
      const selectedText =
        selectedIndex !== undefined ? q.options[selectedIndex].text : 'Not Answered';

      return {
        question_code: q.code,
        question: q.question,
        spectrum: q.spectrum,
        range: q.range,
        options: q.options,
        selected_index: selectedIndex ?? null,
        selected_text: selectedText,
      };
    });

    const finalData = {
      respondent_id: respondentId,
      ...respondentInfo,
      answers: responseData,
    };

    localStorage.setItem('surveyResponses', JSON.stringify(finalData));
    navigate('/survey-response');
  };

  // Helper functions
  const isSelected = (index) => answers[currentQuestion.code] === index;

  const getProgress = () =>
    Math.round(((currentIndex + 1) / questions.length) * 100);

  const getAnsweredCount = () => Object.keys(answers).length;

  const canProceed = () => answers[currentQuestion.code] !== undefined;

  const goToQuestion = (index) => setCurrentIndex(index);

  // Validate email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentInfo.email);

  // Check if all required respondent fields are filled and valid email
  const allFieldsFilled =
    Object.values(respondentInfo).every((val) => val.trim() !== '') &&
    isEmailValid;

  // Render respondent info form before survey starts
  if (showIntro) {
    return (
      <div className="survey-container">
        <header className="survey-header">
          <div className="survey-icon">📝</div>
          <h2 className="survey-title">Respondent Information</h2>
        </header>

        <section className="survey-question-card">
          <div className="options-grid">
            {/* Full Name */}
            <div className="option-card">
              <label htmlFor="fullName" className="option-title">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={respondentInfo.fullName}
                onChange={handleInputChange}
                className="option-input"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="option-card">
              <label htmlFor="email" className="option-title">
                Official Email ID *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={respondentInfo.email}
                onChange={handleInputChange}
                className="option-input"
                autoComplete="email"
              />
              {!isEmailValid && respondentInfo.email.trim() !== '' && (
                <div className="validation-message" style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 4 }}>
                  Please enter a valid email address
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="option-card">
              <label htmlFor="gender" className="option-title">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={respondentInfo.gender}
                onChange={handleInputChange}
                className="option-input"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="option-card">
              <label htmlFor="dob" className="option-title">
                Date of Birth *
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={respondentInfo.dob}
                onChange={handleInputChange}
                className="option-input"
              />
            </div>

            {/* Company */}
            <div className="option-card">
              <label htmlFor="company" className="option-title">
                Company Name *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Enter your company name"
                value={respondentInfo.company}
                onChange={handleInputChange}
                className="option-input"
                autoComplete="organization"
              />
            </div>

            {/* Location */}
            <div className="option-card">
              <label htmlFor="location" className="option-title">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter your location"
                value={respondentInfo.location}
                onChange={handleInputChange}
                className="option-input"
                autoComplete="address-level2"
              />
            </div>

            {/* Tenure */}
            <div className="option-card">
              <label htmlFor="tenure" className="option-title">
                Tenure (in years) *
              </label>
              <input
                id="tenure"
                name="tenure"
                type="text"
                placeholder="e.g., 2.5 years"
                value={respondentInfo.tenure}
                onChange={handleInputChange}
                className="option-input"
              />
            </div>

            {/* Tenure as Manager */}
            <div className="option-card">
              <label htmlFor="tenureManager" className="option-title">
                Tenure as Manager (in years) *
              </label>
              <input
                id="tenureManager"
                name="tenureManager"
                type="text"
                placeholder="e.g., 1.5 years"
                value={respondentInfo.tenureManager}
                onChange={handleInputChange}
                className="option-input"
              />
            </div>
          </div>

          {!allFieldsFilled && (
            <div
              className="validation-message"
              style={{ color: '#e74c3c', textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}
            >
              Please fill in all required fields correctly to continue
            </div>
          )}
        </section>

        <footer className="navigation-footer">
          <button
            className={`nav-button submit-button ${!allFieldsFilled ? 'disabled' : ''}`}
            disabled={!allFieldsFilled}
            onClick={handleStartSurvey}
            style={{ opacity: allFieldsFilled ? 1 : 0.6, cursor: allFieldsFilled ? 'pointer' : 'not-allowed' }}
          >
            Start Survey →
          </button>
        </footer>
      </div>
    );
  }

  // Render main survey page after intro form
  return (
    <div className="survey-container">
      <header className="survey-header">
        <div className="survey-icon">📦</div>
        <h2 className="survey-title">Sample Survey</h2>
        <div className="progress-circle">
          <div className="progress-text">{getProgress()}%</div>
        </div>
      </header>

      <nav className="question-navigation">
        <div className="question-dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`question-dot ${idx === currentIndex ? 'active' : ''} ${
                answers[questions[idx].code] !== undefined ? 'answered' : ''
              }`}
              onClick={() => goToQuestion(idx)}
              title={`Question ${idx + 1}`}
              type="button"
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="question-counter">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </nav>

      <section className="survey-question-card">
        <div className="question-header">
          <span className="question-code">{currentQuestion.code}</span>
          {currentQuestion.spectrum && (
            <span className="question-spectrum">{currentQuestion.spectrum}</span>
          )}
        </div>

        <h3 className="question-text">{currentQuestion.question}</h3>

        {currentQuestion.range && <p className="question-range">{currentQuestion.range}</p>}

        <div className="options-grid">
          {currentQuestion.options.map((option, idx) => (
            <label
              key={idx}
              className={`option-card ${isSelected(idx) ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={currentQuestion.code}
                value={idx}
                checked={isSelected(idx)}
                onChange={() => handleOptionSelect(idx)}
                className="option-input"
              />
              <div className="option-content">
                <div className="option-radio">
                  <div className="radio-inner"></div>
                </div>
                <div className="option-text">
                  <div className="option-title">{option.text}</div>
                  {option.description && (
                    <div className="option-description">{option.description}</div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="answer-summary">
          <span className="answered-count">
            {getAnsweredCount()} of {questions.length} questions answered
          </span>
        </div>
      </section>

      <footer className="navigation-footer">
        <button
          className="nav-button prev-button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          type="button"
        >
          ← Previous
        </button>

        <div className="progress-section">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>Progress</span>
            <span>{getProgress()}%</span>
          </div>
        </div>

        {currentIndex === questions.length - 1 ? (
          <button
            className="nav-button submit-button"
            onClick={handleSubmit}
            disabled={getAnsweredCount() === 0}
            type="button"
          >
            Submit Survey
          </button>
        ) : (
          <button
            className="nav-button next-button"
            onClick={handleNext}
            disabled={!canProceed()}
            type="button"
          >
            Next →
          </button>
        )}
      </footer>

      <div className="quick-actions">
        <button
          className="quick-action"
          onClick={() => {
            const nextUnanswered = questions.findIndex((q) => answers[q.code] === undefined);
            if (nextUnanswered !== -1) goToQuestion(nextUnanswered);
          }}
          disabled={getAnsweredCount() === questions.length}
          type="button"
        >
          Go to next unanswered
        </button>
      </div>
    </div>
  );
};

export default Survey;
