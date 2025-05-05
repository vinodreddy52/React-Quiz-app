import React, { useState, useEffect, useRef } from 'react';
import './Quiz.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const questions = [
  {
    type: 'single',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2
  },
  {
    type: 'single',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1
  },
  {
    type: 'multiple',
    question: 'Which of the following are programming languages?',
    options: ['Python', 'Banana', 'JavaScript', 'Car'],
    correctAnswers: [0, 2]
  },
  {
    type: 'multiple',
    question: 'Select all prime numbers.',
    options: ['2', '3', '4', '5'],
    correctAnswers: [0, 1, 3]
  },
  {
    type: 'matching',
    question: 'Match the country to its capital.',
    pairs: [
      { left: 'Germany', right: 'Berlin' },
      { left: 'Spain', right: 'Madrid' },
      { left: 'Italy', right: 'Rome' }
    ],
    leftItems: ['Germany', 'Spain', 'Italy'],
    rightItems: ['Rome', 'Madrid', 'Berlin']
  },
  {
    type: 'matching',
    question: 'Match the animal to its sound.',
    pairs: [
      { left: 'Dog', right: 'Bark' },
      { left: 'Cat', right: 'Meow' },
      { left: 'Cow', right: 'Moo' }
    ],
    leftItems: ['Dog', 'Cat', 'Cow'],
    rightItems: ['Meow', 'Bark', 'Moo']
  },
  {
    type: 'single',
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'],
    correctAnswer: 2
  },
  {
    type: 'multiple',
    question: 'Which are colors in the rainbow?',
    options: ['Red', 'Cyan', 'Blue', 'Magenta', 'Yellow'],
    correctAnswers: [0, 2, 4]
  },
  {
    type: 'single',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1
  },
  {
    type: 'multiple',
    question: 'Which of these are mammals?',
    options: ['Shark', 'Dolphin', 'Eagle', 'Bat'],
    correctAnswers: [1, 3]
  },
  {
    type: 'matching',
    question: 'Match the inventor to their invention.',
    pairs: [
      { left: 'Edison', right: 'Light Bulb' },
      { left: 'Bell', right: 'Telephone' },
      { left: 'Wright', right: 'Airplane' }
    ],
    leftItems: ['Edison', 'Bell', 'Wright'],
    rightItems: ['Telephone', 'Airplane', 'Light Bulb']
  },
  {
    type: 'single',
    question: 'What is the boiling point of water?',
    options: ['90°C', '100°C', '110°C', '120°C'],
    correctAnswer: 1
  },
  {
    type: 'multiple',
    question: 'Which are programming paradigms?',
    options: ['Object-Oriented', 'Procedural', 'Functional', 'Culinary'],
    correctAnswers: [0, 1, 2]
  },
  {
    type: 'matching',
    question: 'Match the planet to its order from the sun.',
    pairs: [
      { left: 'Mercury', right: '1st' },
      { left: 'Venus', right: '2nd' },
      { left: 'Earth', right: '3rd' }
    ],
    leftItems: ['Mercury', 'Venus', 'Earth'],
    rightItems: ['2nd', '3rd', '1st']
  }
];

const QUESTION_TIME = 15; // seconds per question
const OVERALL_TIME = 180; // seconds for the whole quiz (3 minutes)

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [matchingOrder, setMatchingOrder] = useState([]);
  const [matchingSubmitted, setMatchingSubmitted] = useState(false);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [overallTimer, setOverallTimer] = useState(OVERALL_TIME);
  const timerRef = useRef();
  const overallTimerRef = useRef();

  const q = questions[currentQuestion];

  // Overall timer effect
  useEffect(() => {
    setOverallTimer(OVERALL_TIME);
    if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    if (!showScore) {
      overallTimerRef.current = setInterval(() => {
        setOverallTimer((prev) => {
          if (prev === 1) {
            clearInterval(overallTimerRef.current);
            setShowScore(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(overallTimerRef.current);
    // eslint-disable-next-line
  }, []);

  // Per-question timer effect
  useEffect(() => {
    setTimer(QUESTION_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!showScore) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current);
            handleSubmit(true); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [currentQuestion, showScore]);

  useEffect(() => {
    if (q.type === 'matching') {
      setMatchingOrder([...q.rightItems]);
      setMatchingSubmitted(false);
    }
    // eslint-disable-next-line
  }, [currentQuestion]);

  const handleRadioChange = (index) => {
    setSelectedAnswer(index);
  };

  const handleCheckboxChange = (index) => {
    if (selectedAnswers.includes(index)) {
      setSelectedAnswers(selectedAnswers.filter(i => i !== index));
    } else {
      setSelectedAnswers([...selectedAnswers, index]);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(matchingOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setMatchingOrder(newOrder);
  };

  const handleSubmit = (auto = false) => {
    let isCorrect = false;
    if (q.type === 'single') {
      isCorrect = selectedAnswer === q.correctAnswer;
    } else if (q.type === 'multiple') {
      isCorrect =
        selectedAnswers.length === q.correctAnswers.length &&
        selectedAnswers.every((val) => q.correctAnswers.includes(val));
    } else if (q.type === 'matching') {
      isCorrect = q.pairs.every((pair, idx) => matchingOrder[idx] === pair.right);
      setMatchingSubmitted(true);
    }
    if (isCorrect) setScore(score + 1);
    setTimeout(() => {
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setMatchingOrder([]);
      setMatchingSubmitted(false);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowScore(true);
      }
    }, auto ? 800 : 1200);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setMatchingOrder([]);
      setMatchingSubmitted(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setMatchingOrder([]);
    setMatchingSubmitted(false);
    setTimer(QUESTION_TIME);
    setOverallTimer(OVERALL_TIME);
  };

  // Format overall timer as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        <div
          className="progress-bar-inner"
          style={{ width: `${((currentQuestion + (showScore ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      {/* Overall timer */}
      {!showScore && (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <span className={`timer-pill${overallTimer <= 30 ? ' red' : ''}`}>⏳ {formatTime(overallTimer)}</span>
          <span className={`timer-pill${timer <= 5 ? ' red' : ''}`}>⏰ {timer}s</span>
        </div>
      )}
      {showScore ? (
        <div className="score-section">
          <h2>Quiz Completed!</h2>
          <p>You scored {score} out of {questions.length}</p>
          <button onClick={restartQuiz} className="restart-button">
            Restart Quiz
          </button>
        </div>
      ) : (
        <div className="question-section">
          <div className="question-count">
            <span>Question {currentQuestion + 1}</span>/{questions.length}
          </div>
          <div className="question-text">{q.question}</div>
          <div className="answer-section">
            {q.type === 'single' && (
              <form>
                {q.options.map((option, idx) => (
                  <label key={idx} className="option-label">
                    <input
                      type="radio"
                      name="single"
                      checked={selectedAnswer === idx}
                      onChange={() => handleRadioChange(idx)}
                    />
                    {option}
                  </label>
                ))}
              </form>
            )}
            {q.type === 'multiple' && (
              <form>
                {q.options.map((option, idx) => (
                  <label key={idx} className="option-label">
                    <input
                      type="checkbox"
                      checked={selectedAnswers.includes(idx)}
                      onChange={() => handleCheckboxChange(idx)}
                    />
                    {option}
                  </label>
                ))}
              </form>
            )}
            {q.type === 'matching' && (
              <div className="matching-section">
                <div className="matching-columns">
                  <div className="matching-left-col">
                    {q.leftItems.map((left, idx) => (
                      <div key={idx} className="matching-row">{left}</div>
                    ))}
                  </div>
                  <div className="matching-right-col">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="droppable">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {matchingOrder.map((item, idx) => (
                              <Draggable key={item} draggableId={item} index={idx}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`matching-draggable${matchingSubmitted && item === q.pairs[idx].right ? ' correct' : ''}${matchingSubmitted && item !== q.pairs[idx].right ? ' wrong' : ''}`}
                                  >
                                    {item}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
              <button
                className="answer-button submit-btn"
                onClick={e => { e.preventDefault(); handlePrevious(); }}
                disabled={currentQuestion === 0}
                style={{ background: 'linear-gradient(90deg, #a1a1aa 0%, #6366f1 100%)', color: '#fff', minWidth: 120 }}
              >
                Previous
              </button>
              <button
                className="answer-button submit-btn"
                onClick={e => { e.preventDefault(); handleSubmit(); }}
                disabled={
                  (q.type === 'single' && selectedAnswer === null) ||
                  (q.type === 'multiple' && selectedAnswers.length === 0) ||
                  (q.type === 'matching' && matchingOrder.length !== q.leftItems.length)
                }
                style={{ minWidth: 120 }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz; 