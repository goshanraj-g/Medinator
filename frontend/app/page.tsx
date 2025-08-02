'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WelcomePage from './components/WelcomePage';
import ContextForm from './components/ContextForm';
import AssessmentPage from './components/AssessmentPage';

interface UserContext {
  age: string;
  gender: string;
  height: string;
  weight: string;
  ethnicity: string;
  concerns: string;
}

interface Question {
  question: string;
  question_id: number;
  total_questions: number;
  options: string[];
  message?: string;
}

export default function HealthAssessmentTool() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'context' | 'assessment'>('welcome');
  const [userContext, setUserContext] = useState<UserContext>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    concerns: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: "How would you rate your current stress level?",
    question_id: 1,
    total_questions: 10,
    options: ["Very Low", "Low", "Moderate", "High", "Very High"],
    message: "Based on your profile, let's start with understanding your stress levels."
  });

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!userContext.age) newErrors.age = 'Age is required';
    if (!userContext.gender) newErrors.gender = 'Gender is required';
    if (!userContext.height) newErrors.height = 'Height is required';
    if (!userContext.weight) newErrors.weight = 'Weight is required';
    if (!userContext.ethnicity) newErrors.ethnicity = 'Ethnicity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContextSubmit = () => {
    if (validateForm()) {
      fetch('http://127.0.0.1:5000/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userContext),
      }).then((response) => response.json())
      .then((data) => {
        console.log('Response from backend:', data);
        // Update current question with backend response
        if (data.question) {
          setCurrentQuestion(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

      setCurrentStep('assessment');
    }
  };

  const handleStartAssessment = () => {
    setCurrentStep('context');
  };

  const handleAnswerSelect = (answer: string) => {
    // Send answer to backend and get next question
    fetch('http://127.0.0.1:5000/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_id: currentQuestion.question_id,
        answer: answer,
        user_context: userContext
      }),
    }).then((response) => response.json())
    .then((data) => {
      console.log('Next question:', data);
      if (data.question) {
        setCurrentQuestion(data);
      } else {
        // Assessment complete - handle results
        console.log('Assessment complete:', data);
      }
    })
    .catch((error) => {
      console.error('Error getting next question:', error);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentStep === 'welcome' && (
          <WelcomePage onStartAssessment={handleStartAssessment} />
        )}

        {currentStep === 'context' && (
          <ContextForm
            userContext={userContext}
            setUserContext={setUserContext}
            errors={errors}
            onBack={() => setCurrentStep('welcome')}
            onSubmit={handleContextSubmit}
          />
        )}

        {currentStep === 'assessment' && (
          <AssessmentPage
            currentQuestion={currentQuestion}
            onAnswerSelect={handleAnswerSelect}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
