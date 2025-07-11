// src/components/ImageUploader.jsx
import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const ImageUploader = ({ onImageSelected }) => {
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <Stack direction="column" alignItems="center" spacing={1}>
      <input
        accept="image/*"
        capture="environment"
        id="image-uploader-input"
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <label htmlFor="image-uploader-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<PhotoCameraIcon />}
          sx={{
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
          }}
        >
          Upload Image
        </Button>
      </label>
      <Typography variant="caption" color="text.secondary" align="center">
        Take or choose a photo of your vegetables
      </Typography>
    </Stack>
  );
};

export default ImageUploader;
