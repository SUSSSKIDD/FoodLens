# 🥦 FoodLens — AI-Powered Recipe Generation Web App

**FoodLens** is a scalable, production-ready PWA (Progressive Web App) that allows users to detect vegetables via image input, generate personalized recipes using Gemini AI, and cook with intelligent, multilingual step-by-step guidance.

Built using a modern tech stack of **React + Express + YOLOv8 + Gemini + GCP, FoodLens is optimized for performance, accessibility, and scalability across mobile and desktop.

---

## 🚀 Key Features

- 📷 **Vegetable Detection:** Upload or scan a photo; the backend uses a custom-trained **YOLOv8m (ONNX)** model with **87% mAP@0.5** accuracy, trained on 500+ labeled images (70:15:15 split).
- 🍲 **AI Recipe Generation:** Uses **Gemini 1.5 Flash** (via SDK) to create structured, healthy recipes tailored to:
  - Serving size, cuisine type, dietary needs, allergies, cooking time, spice level, diabetic/lactose preferences.
- 🌍 **Multilingual Support:** Generates recipe output in **English or Hindi**, auto-switchable with fallback.
- 🗣️ **Interactive Cooking Mode:** 
  - Step-by-step cooking guide
  - **Text-to-speech**
  - **Timer detection** 
  - Context-aware **chatbot assistant** while cooking
- 💾 **Save / Edit / Delete Recipes:** Authenticated users can manage recipes and update them post-cooking.
- 🧾 **Cook History:** Automatically logs finished recipes to a separate MongoDB collection for review.
- 📲 **Mobile-First PWA:** Fully installable,  and responsive across all device sizes.

---

## ⚙️ Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| **Frontend** | React (Vite), Tailwind CSS, vite-plugin-pwa    |
| **Backend**  | Node.js, Express.js                            |
| **Model**    | YOLOv8L (ONNX runtime) via Roboflow            |
| **AI API**   | Google Gemini 1.5 Flash SDK                    |
| **Auth**     | Firebase Auth (Google login) + Passport.js     |
| **Database** | MongoDB Atlas (User, Recipes, CookedHistory)   |
| **Cloud**    | App Engine (Node backend), Firebase Hosting    |
| **Security** | JWT, Secret Manager, Helmet, CORS              |
| **Scaling**  | Auto-scaled on GCP with fallback across US + India regions |



