import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CameraInput from './CameraInput';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://foodlens-api-105131501134.us-central1.run.app/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => {
          setUserEmail(data.email);
        })
        .catch(() => {
          setUserEmail('');
        });
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', background: '#eee' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>📷 Camera</Link>
          <Link to="/profile" style={{ marginRight: '1rem' }}>📚 Saved Recipes</Link>
          <Link to="/login" style={{ marginRight: '1rem' }}>🔐 Login</Link>
          <Link to="/signup">🆕 Sign Up</Link>
          {userEmail && (
            <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>👋 {userEmail}</span>
          )}
        </nav>

        <h1 style={{ marginTop: '1rem' }}>🥦 FoodLens</h1>

        <Routes>
          <Route path="/" element={<CameraInput />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
