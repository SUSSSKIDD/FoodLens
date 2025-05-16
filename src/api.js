import axios from 'axios';

const API_URL = 'https://foodlens-api-105131501134.us-central1.run.app/predict';

// 🔍 Prediction API
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

export const fetchGeminiRecipe = async (ingredients, language = "en") => {
  const prompt = language === "en"
    ? `Suggest a recipe using only these vegetables: ${ingredients.join(', ')}. Do not use any other vegatbles. List steps clearly.`
    : `सिर्फ इन सब्ज़ियों का उपयोग करके एक स्वादिष्ट रेसिपी सुझाएं: ${ingredients.join(', ')}। किसी अन्य सब्जी का उपयोग न करें और विधि को स्पष्ट रूप से चरणों में बताएं।`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBfWYcXSBQmpZ51eyw4lL1fIi2M0nJkr40', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No recipe found.";
    console.log("🌱 Gemini response:", content);
    return content;

  } catch (err) {
    console.error("Gemini error:", err);
    return "⚠️ Error generating recipe.";
  }
};
