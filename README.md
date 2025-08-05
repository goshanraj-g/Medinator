# 🧠 Medinator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js v14](https://img.shields.io/badge/Next.js-%20v14-000000.svg?logo=nextdotjs)](https://nextjs.org/)
[![Flask v3.0](https://img.shields.io/badge/Flask-%20v3.0-000000.svg?logo=flask)](https://flask.palletsprojects.com/)
[![Tailwind CSS v3.4](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC.svg)](https://tailwindcss.com/)
[![scikit-learn v1.5](https://img.shields.io/badge/ML-scikit--learn%20v1.5-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org/)
[![Gemini API](https://img.shields.io/badge/AI-Gemini%20-4285F4.svg?logo=google)](https://deepmind.google/technologies/gemini)


<p align="center">
  <img src="frontend/public/medinator.png" alt="Medinator Logo" width="70"/>
</p>

---

## 🧬 About the Project

**Medinator** is a conversational web app that helps users reflect on their lifestyle and uncover potential long-term health risks.

Inspired by apps like *Akinator*, Medinator adapts its questions based on your responses to flag risk factors for chronic conditions such as hypertension, diabetes, and depression using real-world data and AI.

> ⚠️ **Note:** Your data is **never stored**, everything runs **locally** in the browser for your privacy and peace of mind.

---

## 💡 Key Features

- 🧠 **Conversational Screener**: Dynamically adjusts questions based on your answers (like Akinator).
- 🍎 **Lifestyle Evaluation**: Assesses diet, exercise, sleep, stress, and more.
- 🧪 **Risk Detection**: Flags risk factors for chronic conditions using structured data + ML.
- 🧘 **Personalized Advice**: Integrates Gemini to summarize risks and provide AI-generated health feedback.
- 🔒 **Privacy-first**: No user data is stored. All evaluation happens client-side.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** (React + TypeScript)
- **TailwindCSS**

### Backend
- **Python** with **Flask**
- **REST APIs** for:
  - Rule-based logic
  - ML risk prediction
  - Gemini AI prompts

### Machine Learning
- **Random Forest Classifier** (via scikit-learn)
- **Data Engineering** using pandas + NumPy
- **Canadian Community Health Survey (CCHS)** as source data

### AI Layer
- **Google Gemini** (Generative Language API)
  - Interprets responses
  - Provides advice
  - Summarizes medical risk using data from **Mayo Clinic**, **WebMD**, and **Cleveland Clinic**

---

## 🧪 Sample Flow: Diabetes Risk Screener

- User indicates a sedentary lifestyle and poor sleep.
- Medinator follows up with questions about sugar intake and BMI.
- Backend flags potential risk for Type 2 Diabetes.
- Gemini explains the findings, suggests improvements, and links to medical resources.

---

## 🚀 Getting Started

### Prerequisites
- Node.js + npm
- Python 3.10+
- (Optional) Google API Key for Gemini access

### Setup

```bash
git clone https://github.com/your-username/medinator.git
cd medinator

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Screenshots

<p align="center">
  <img src="frontend/public/screenshot-quiz.png" alt="Quiz Screen" width="600"/>
</p>

<p align="center">
  <img src="frontend/public/screenshot-result.png" alt="Result Screen" width="600"/>
</p>

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
