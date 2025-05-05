import React, { useState } from 'react';
import Quiz from './components/Quiz';
import './App.css';

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className="quiz-container">
      <h2 style={{marginBottom: 24}}>Welcome to the Quiz!</h2>
      <form onSubmit={e => { e.preventDefault(); onLogin({ name, email }); }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1.5px solid #ccc', marginBottom: 16 }}
        />
        <input
          type="email"
          placeholder="Enter your email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1.5px solid #ccc', marginBottom: 24 }}
        />
        <button className="answer-button submit-btn" type="submit" style={{ width: '100%' }}>
          Continue
        </button>
      </form>
    </div>
  );
}

function Instructions({ user, onStart }) {
  return (
    <div className="quiz-container">
      <h2 style={{marginBottom: 16}}>Hi {user.name}!</h2>
      <h3 style={{marginBottom: 18, color: '#6366f1'}}>Quiz Instructions</h3>
      <ul style={{textAlign: 'left', margin: '0 auto 24px auto', maxWidth: 400, color: '#333', fontSize: 17, lineHeight: 1.7}}>
        <li>Each question has a timer. Answer before time runs out!</li>
        <li>You cannot skip questions. Use the Previous button to review.</li>
        <li>Once you finish, you'll see your score and can restart.</li>
        <li>Good luck and have fun!</li>
      </ul>
      <button className="answer-button submit-btn" style={{ width: 200 }} onClick={onStart}>
        Start Quiz
      </button>
    </div>
  );
}

function App() {
  const [stage, setStage] = useState('login'); // login, instructions, quiz
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Quiz App</h1>
      </header>
      <main>
        {stage === 'login' && <Login onLogin={user => { setUser(user); setStage('instructions'); }} />}
        {stage === 'instructions' && <Instructions user={user} onStart={() => setStage('quiz')} />}
        {stage === 'quiz' && <Quiz user={user} />}
      </main>
    </div>
  );
}

export default App;
