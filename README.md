# Medinator

A conversational web app that helps users reflect on their lifestyle and receive insights about their long-term health. Inspired by Akinator, this tool asks a series of adaptive questions to flag risk factors for common chronic conditions using real-world data and AI.

---

## 💡 What it does

This app acts as a personal health screener. It starts with simple questions about your lifestyle — covering diet, exercise, sleep, stress, and more. Based on your answers, the app intelligently adapts and follows up with more specific questions when needed.

Using real-world data from the Canadian Community Health Survey (CCHS) and insights from trusted medical sources like Mayo Clinic, WebMD, and the Cleveland Clinic, the app evaluates your risk for chronic conditions and provides helpful warnings.

Your data is never stored. Everything runs locally for privacy and peace of mind.

---

## 🛠️ How we built it

- **Frontend**: Built with `Next.js`, `React.js`, `TypeScript`, and `TailwindCSS` for a fast and responsive user experience.
- **Backend**: Powered by `Flask` and `Python`, responsible for processing inputs, managing model logic, and communicating with the AI layer.

### 🧪 Risk Analysis

- We developed a **custom rule-based model** using structured data from the Canadian Community Health Survey.
- We trained a **Random Forest Classifier** using `scikit-learn` to support automated risk prediction.
- Data was cleaned and preprocessed using `pandas` and `NumPy`, with careful feature engineering for high-quality analysis.

### 🤖 AI Enhancement with Gemini

To make results smarter and more personalized, we integrated **Gemini** from the Google Generative Language API. It interprets user responses, summarizes risk findings, and provides health advice informed by trusted clinical sources.
