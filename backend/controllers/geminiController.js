const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Validate API keys
if (!process.env.GEMINI_CHAT_API_KEY) {
  console.error('❌ GEMINI_CHAT_API_KEY is not set in environment variables');
}

// Use a separate key for the chatbot
const chatGenAI = new GoogleGenerativeAI(process.env.GEMINI_CHAT_API_KEY);

exports.geminiChat = async (req, res) => {
  try {
    const { recipe, step, message } = req.body;

    // Validate required fields
    if (!recipe || !message) {
      return res.status(400).json({ message: 'Recipe and message are required' });
    }

    const prompt = `
You are a helpful cooking assistant. The user is currently cooking this recipe:

${JSON.stringify(recipe, null, 2)}

Current step: ${step}
User message: "${message}"

If the user asks for a substitution, step change, clarification, or a change in cooking method (e.g., no oven), you MUST respond with a JSON object describing the action (e.g., add_ingredient, remove_ingredient, substitute_ingredient, skip_step, add_step, edit_step) and an explanation. For step changes, include the action (e.g., edit_step), the step number to change, and the new step text. Do not just give advice—always provide a JSON suggestion for any recipe modification. Example:
{
  "action": "substitute_ingredient",
  "details": { "from": "onion", "to": "garlic" },
  "explanation": "You can substitute onion with garlic in this recipe."
}
Or for a step change:
{
  "action": "edit_step",
  "details": { "step_number": 4, "new_text": "Cook the broccoli in a skillet over medium heat for 8-10 minutes, stirring occasionally, until tender and slightly crispy." },
  "explanation": "Since you don't have an oven, cook the broccoli in a skillet instead of roasting."
}
If the user is just asking a question and not requesting a change, reply as normal.
`;

    // Use the chatGenAI instance for the chatbot
    const model = chatGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    res.json({ reply: text });
  } catch (err) {
    console.error('Gemini error:', err.message);
    
    // Provide more specific error messages
    if (err.message.includes('API key')) {
      return res.status(500).json({ message: 'Gemini API configuration error. Please contact support.' });
    }
    
    if (err.message.includes('quota')) {
      return res.status(429).json({ message: 'Gemini API quota exceeded. Please try again later.' });
    }
    
    res.status(500).json({ message: 'Failed to get Gemini response. Please try again.' });
  }
}; 