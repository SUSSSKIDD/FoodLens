import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CameraInput from './CameraInput';
import Profile from './pages/Profile';
import GoogleLoginButton from './components/GoogleLoginButton';

function App() {
  const [user, setUser] = useState(null); // user object: { email, name }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('https://foodlens-api-105131501134.us-central1.run.app/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '1rem', background: '#eee' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>📷 Camera</Link>
          <Link to="/profile" style={{ marginRight: '1rem' }}>📚 Saved Recipes</Link>

          {!user && (
            <span style={{ marginRight: '1rem' }}>
              <GoogleLoginButton />
            </span>
          )}
          {user && (
            <span style={{ fontWeight: 'bold' }}>
              👋 {user.name || user.email}
            </span>
          )}
        </nav>

        <h1 style={{ marginTop: '1rem' }}>🥦 FoodLens</h1>

        <Routes>
          <Route path="/" element={<CameraInput />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
