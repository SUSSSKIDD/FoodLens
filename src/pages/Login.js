import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://foodlens-api-105131501134.us-central1.run.app/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setMsg('✅ Logged in!');
    } catch (err) {
      setMsg('❌ Login failed.');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🔐 Login to FoodLens</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ margin: '0.5rem', padding: '0.5rem' }}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ margin: '0.5rem', padding: '0.5rem' }}
        />
        <br />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Login</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default Login;
