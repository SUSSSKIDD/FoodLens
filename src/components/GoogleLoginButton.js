import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const email = decoded.email;
    const name = decoded.name;

    try {
      await axios.post('https://foodlens-api-105131501134.us-central1.run.app/register', {
        email,
        password: 'google-auth',
        name,
      });
    } catch (err) {
      // Ignore "already exists" error
    }

    // Always try to log in
    try {
      const res = await axios.post('https://foodlens-api-105131501134.us-central1.run.app/login', {
        email,
        password: 'google-auth',
      });

      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <div style={{ display: 'inline-block', marginLeft: '1rem' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log('Google Login Failed')}
      />
    </div>
  );
};

export default GoogleLoginButton;
