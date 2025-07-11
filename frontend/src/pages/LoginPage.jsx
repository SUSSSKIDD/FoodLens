import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';

import { API_URL } from '../config';

const LoginPage = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);

  // Greeting logic unchanged
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSignupChange = (e) => {
    setSignupForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmailLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleSignup = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/signup`, signupForm);
      alert('User registered successfully! Please login with your credentials.');
      // Populate login form with signed-up creds
      setForm({ email: signupForm.email, password: signupForm.password });
      setIsSignup(false);
    } catch (err) {
      alert('Signup failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/google-login`, { idToken });
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Dark mode / Home / Logout */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Stack direction="row" spacing={1}>
          <DarkModeToggle />
          {/* {user && <HomeButton />} */}
          {/* {user && <LogoutButton />} */}
        </Stack>
      </Box>

      <Card sx={{ maxWidth: 360, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar src="/favicon.ico" sx={{ width: 64, height: 64 }} />
            <Typography variant="h5" align="center">
              FoodLens
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Your AI‑powered food & cooking assistant
            </Typography>
            {user && (
              <Typography variant="subtitle1" color="success.main" align="center">
                {greeting} 🌱
              </Typography>
            )}
          </Stack>

          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Stack spacing={2}>
              {isSignup && (
                <>
                  <Typography variant="h6" color="warning.main" align="center">
                    Create Account
                  </Typography>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                  />
                </>
              )}

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={isSignup ? signupForm.email : form.email}
                onChange={isSignup ? handleSignupChange : handleChange}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={isSignup ? signupForm.password : form.password}
                onChange={isSignup ? handleSignupChange : handleChange}
              />

              {/* Primary action */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={isSignup ? handleSignup : handleEmailLogin}
              >
                {isSignup ? 'Sign Up' : 'Log In'}
              </Button>

              {/* Google login only on Log In */}
              {!isSignup && (
                <>
                  <Divider>Or</Divider>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    size="large"
                    onClick={handleGoogleLogin}
                  >
                    Continue with Google
                  </Button>
                </>
              )}

              {/* Toggle form */}
              <Button
                fullWidth
                variant="text"
                onClick={() => setIsSignup((prev) => !prev)}
              >
                {isSignup
                  ? 'Already have an account? Log in'
                  : 'New user? Create an account'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
