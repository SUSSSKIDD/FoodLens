import axios from 'axios';

const API_URL = 'https://foodlens-api-105131501134.us-central1.run.app/predict';
 

export const predictImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Prediction error:', err);
    return null;
  }
};
