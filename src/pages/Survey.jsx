import { useState } from "react";
import { useNavigate } from "react-router-dom";
import questionsData from "../Json/question_options.json";
import "../Styles/Survey.css";

const Survey = () => {
  const navigate = useNavigate();
  const questions = questionsData.assessment_data;

  // State for survey progress and answers
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // State for respondent info form
  const [respondentInfo, setRespondentInfo] = useState({
    fullName: "",
    email: "",
    gender: "",
    dob: "",
    company: "",
    location: "",
    tenure: "",
    tenureManager: "",
  });

  const [showIntro, setShowIntro] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Generate random 6-digit respondent ID on every render (could be improved to persist on session)
  const respondentId = Math.floor(100000 + Math.random() * 900000);

  const currentQuestion = questions[currentIndex];

  // Likert scale options
  const likertOptions = [
    { value: 4, label: "Strongly Agree", shortLabel: "SA" },
    { value: 3, label: "Agree", shortLabel: "A" },
    { value: 2, label: "Disagree", shortLabel: "D" },
    { value: 1, label: "Strongly Disagree", shortLabel: "SD" },
  ];

  // Handle answer selection per question - now handles multiple statements per question
  const handleLikertSelect = (statementIndex, rating) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.code]: {
        ...prev[currentQuestion.code],
        [statementIndex]: rating,
      },
    }));
  };

  // Navigate to next or previous question
  const handleNext = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
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
      const questionAnswers = answers[q.code] || {};
      const statementResponses = q.options.map((option, idx) => ({
        statement: option.text,
        description: option.description || "",
        rating: questionAnswers[idx] || null,
        rating_text: questionAnswers[idx]
          ? likertOptions.find((opt) => opt.value === questionAnswers[idx])
              ?.label
          : "Not Answered",
      }));

      return {
        question_code: q.code,
        question: q.question,
        spectrum: q.spectrum,
        range: q.range,
        statements: statementResponses,
      };
    });

    const finalData = {
      respondent_id: respondentId,
      ...respondentInfo,
      answers: responseData,
    };

    localStorage.setItem("surveyResponses", JSON.stringify(finalData));
    navigate("/survey-response");
  };

  // Helper functions
  const isStatementRated = (statementIndex, rating) => {
    return answers[currentQuestion.code]?.[statementIndex] === rating;
  };

  const getProgress = () =>
    Math.round(((currentIndex + 1) / questions.length) * 100);

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((questionCode) => {
      const questionAnswers = answers[questionCode];
      if (!questionAnswers || typeof questionAnswers !== "object") return false;

      // Check if all statements in the question are answered
      const question = questions.find((q) => q.code === questionCode);
      if (!question) return false;

      return question.options.every(
        (_, idx) =>
          questionAnswers[idx] !== undefined && questionAnswers[idx] !== null
      );
    }).length;
  };

  const canProceed = () => {
    const questionAnswers = answers[currentQuestion.code];
    if (!questionAnswers || typeof questionAnswers !== "object") return false;

    // Check if all statements are answered
    return currentQuestion.options.every(
      (_, idx) =>
        questionAnswers[idx] !== undefined && questionAnswers[idx] !== null
    );
  };

  const goToQuestion = (index) => setCurrentIndex(index);

  // Validate email format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentInfo.email);

  // Check if all required respondent fields are filled and valid email
  const allFieldsFilled =
    Object.values(respondentInfo).every((val) => val.trim() !== "") &&
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
          <div className="respondent-form-grid">
            {/* Full Name */}
            <div className="form-field">
              <label htmlFor="fullName" className="field-label">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={respondentInfo.fullName}
                onChange={handleInputChange}
                className="field-input"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="email" className="field-label">
                Official Email ID *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={respondentInfo.email}
                onChange={handleInputChange}
                className="field-input"
                autoComplete="email"
              />
              {!isEmailValid && respondentInfo.email.trim() !== "" && (
                <div className="validation-message">
                  Please enter a valid email address
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="form-field">
              <label htmlFor="gender" className="field-label">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={respondentInfo.gender}
                onChange={handleInputChange}
                className="field-input"
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
            <div className="form-field">
              <label htmlFor="dob" className="field-label">
                Date of Birth *
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={respondentInfo.dob}
                onChange={handleInputChange}
                className="field-input"
              />
            </div>

            {/* Company */}
            <div className="form-field">
              <label htmlFor="company" className="field-label">
                Company Name *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Enter your company name"
                value={respondentInfo.company}
                onChange={handleInputChange}
                className="field-input"
                autoComplete="organization"
              />
            </div>

            {/* Location */}
            <div className="form-field">
              <label htmlFor="location" className="field-label">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter your location"
                value={respondentInfo.location}
                onChange={handleInputChange}
                className="field-input"
                autoComplete="address-level2"
              />
            </div>

            {/* Tenure */}
            <div className="form-field">
              <label htmlFor="tenure" className="field-label">
                Tenure (in years) *
              </label>
              <input
                id="tenure"
                name="tenure"
                type="text"
                placeholder="e.g., 2.5 years"
                value={respondentInfo.tenure}
                onChange={handleInputChange}
                className="field-input"
              />
            </div>

            {/* Tenure as Manager */}
            <div className="form-field">
              <label htmlFor="tenureManager" className="field-label">
                Tenure as Manager (in years) *
              </label>
              <input
                id="tenureManager"
                name="tenureManager"
                type="text"
                placeholder="e.g., 1.5 years"
                value={respondentInfo.tenureManager}
                onChange={handleInputChange}
                className="field-input"
              />
            </div>
          </div>

          {!allFieldsFilled && (
            <div className="form-validation-message">
              Please fill in all required fields correctly to continue
            </div>
          )}
        </section>

        <footer className="navigation-footer">
          <button
            className={`nav-button submit-button ${
              !allFieldsFilled ? "disabled" : ""
            }`}
            disabled={!allFieldsFilled}
            onClick={handleStartSurvey}
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
              className={`question-dot ${
                idx === currentIndex ? "active" : ""
              } ${getAnsweredCount() > idx ? "answered" : ""}`}
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
            <span className="question-spectrum">
              {currentQuestion.spectrum}
            </span>
          )}
        </div>

        <h3 className="question-text">{currentQuestion.question}</h3>

        {currentQuestion.range && (
          <p className="question-range">{currentQuestion.range}</p>
        )}

        {/* Enhanced Likert Scale Layout */}
        <div className="likert-container">
          {/* Likert Scale Header */}
          <div className="likert-header">
            <div className="statement-header">Statement</div>
            <div className="rating-headers">
              {likertOptions.map((option) => (
                <div key={option.value} className="rating-header">
                  <span className="rating-full">{option.label}</span>
                  <span className="rating-short">{option.shortLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statements with Rating Options */}
          <div className="statements-container">
            {currentQuestion.options.map((option, statementIdx) => (
              <div key={statementIdx} className="statement-row">
                <div className="statement-content">
                  <div className="statement-text">{option.text}</div>
                  {option.description && (
                    <div className="statement-description">
                      {option.description}
                    </div>
                  )}
                </div>

                <div className="rating-options">
                  {likertOptions.map((likertOption) => (
                    <div key={likertOption.value} className="rating-option">
                      <label className="rating-label">
                        <input
                          type="radio"
                          name={`${currentQuestion.code}_${statementIdx}`}
                          value={likertOption.value}
                          checked={isStatementRated(
                            statementIdx,
                            likertOption.value
                          )}
                          onChange={() =>
                            handleLikertSelect(statementIdx, likertOption.value)
                          }
                          className="rating-input"
                        />
                        <div
                          className={`rating-circle ${
                            isStatementRated(statementIdx, likertOption.value)
                              ? "selected"
                              : ""
                          }`}
                        >
                          <div className="rating-inner"></div>
                        </div>
                        <span className="rating-tooltip">
                          {likertOption.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            const nextUnanswered = questions.findIndex((q) => {
              const questionAnswers = answers[q.code];
              if (!questionAnswers || typeof questionAnswers !== "object")
                return true;
              return !q.options.every(
                (_, idx) =>
                  questionAnswers[idx] !== undefined &&
                  questionAnswers[idx] !== null
              );
            });
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
