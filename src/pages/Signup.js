import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://foodlens-api-105131501134.us-central1.run.app/register', { email, password });
      setMsg('✅ Registered successfully. You can now log in.');
    } catch (err) {
      setMsg('❌ Registration failed. Try a different email.');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🆕 Create a FoodLens Account</h2>
      <form onSubmit={handleSignup}>
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
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Sign Up</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default Signup;
