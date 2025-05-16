import React, { useState } from 'react';
import { predictImage, fetchGeminiRecipe } from './api';

const CameraInput = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [recipe, setRecipe] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setDetections([]);
    setError('');
    setRecipe('');

    const response = await predictImage(file);

    if (response && response.detections && response.detections.length > 0) {
      setDetections(response.detections);

      const veggieList = response.detections.map(d => d.class);
      const recipeResponse = await fetchGeminiRecipe(veggieList, language);
      setRecipe(recipeResponse);
    } else if (response && response.detections && response.detections.length === 0) {
      setError("No vegetables detected.");
    } else {
      setError("Prediction failed or server not reachable.");
    }

    console.log("🔍 API Response:", response);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);

    if (detections.length > 0) {
      const veggieList = detections.map(d => d.class);
      fetchGeminiRecipe(veggieList, newLang).then(setRecipe);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={toggleLanguage}>
          Switch to {language === 'en' ? 'Hindi' : 'English'}
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ marginBottom: '1rem' }}
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Captured vegetable"
          style={{
            width: '90%',
            maxWidth: '320px',
            borderRadius: '12px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            marginTop: '1rem',
          }}
        />
      )}

      {detections.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {detections.map((det, idx) => (
            <li key={idx} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>{det.class}</strong> — {Math.round(det.confidence * 100)}%
            </li>
          ))}
        </ul>
      )}

      {recipe && (
        <div
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#f2f2f2',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'left',
            maxWidth: '90%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <h3>🍲 Suggested Recipe ({language === 'en' ? 'English' : 'Hindi'})</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe}</p>
        </div>
      )}

      {error && (
        <p style={{ marginTop: '1rem', color: '#999', fontStyle: 'italic' }}>{error}</p>
      )}
    </div>
  );
};

export default CameraInput;
