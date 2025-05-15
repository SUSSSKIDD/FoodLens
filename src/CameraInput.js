import React, { useState } from 'react';
import { predictImage } from './api';

const CameraInput = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setDetections([]);
    setError('');

    const response = await predictImage(file);

    if (response && response.detections && response.detections.length > 0) {
      setDetections(response.detections);
    } else if (response && response.detections && response.detections.length === 0) {
      setError("No vegetables detected.");
    } else {
      setError("Prediction failed or server not reachable.");
    }

    console.log("🔍 API Response:", response);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ margin: '1rem 0' }}
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

      {error && (
        <p style={{ marginTop: '1rem', color: '#999', fontStyle: 'italic' }}>{error}</p>
      )}
    </div>
  );
};

export default CameraInput;
