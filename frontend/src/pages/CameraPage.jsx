import React, { useState, useRef, useEffect, useContext } from 'react';
import ImageUploader from '../components/ImageUploader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// <— Removed local imports of DarkModeToggle, SavedRecipesButton, LogoutButton
import { API_URL } from '../config';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import KitchenIcon from '@mui/icons-material/Kitchen';

const CameraPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const imageRef = useRef();
  const [imgDims, setImgDims] = useState({ width: 640, height: 640 });

  const handleImageChange = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    detectVegetables(file);
  };

  useEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setImgDims({ width, height });
    }
  }, [image]);

  const detectVegetables = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(
        `${API_URL}/api/detect`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setDetections(res.data.detected);
    } catch (err) {
      console.error('Detection error:', err);
      alert('Failed to detect vegetables.');
    }
  };

  const handleContinue = () => {
    navigate('/recipe', { state: { detectedVeggies: detections } });
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
      {/* NO local controls here – the global header now handles them */}

      {/* Main content card */}
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <KitchenIcon />
            </Avatar>
            <Typography variant="h5" align="center">
              Detect Vegetables
            </Typography>
            {user && (
              <Typography variant="subtitle1" color="success.main" align="center">
                {greeting}, {user.name}! 🌱
              </Typography>
            )}
          </Stack>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <ImageUploader onImageSelected={handleImageChange} />
          </Box>

          {image && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Box
                component="img"
                src={image}
                alt="Uploaded"
                ref={imageRef}
                sx={{ maxWidth: '100%', border: 1, borderColor: 'grey.300' }}
                onLoad={() => {
                  const { width, height } = imageRef.current.getBoundingClientRect();
                  setImgDims({ width, height });
                }}
              />
            </Box>
          )}

          {detections.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }}>Results</Divider>
              <Stack spacing={1}>
                {detections.map((det, idx) => (
                  <Typography key={idx} variant="body1">
                    ✅ {det.label} ({det.confidence}%)
                  </Typography>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={handleContinue}
              >
                Next: Generate Recipe
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CameraPage;
