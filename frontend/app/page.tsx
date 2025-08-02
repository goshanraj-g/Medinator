'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WelcomePage from './components/WelcomePage';
import ContextForm from './components/ContextForm';
import AssessmentPage from './components/AssessmentPage';
import { assessmentQuestions, getQuestionById, getNextQuestion, Question } from './data/assessmentQuestions';

interface UserContext {
  age: string;
  gender: string;
  height: string;
  weight: string;
  ethnicity: string;
  concerns: string;
  // Lifestyle factors
  smoking: string;
  alcohol: string;
  activity: string;
  sleep: string;
  // Medical history
  familyHistory: string;
  conditions: string;
  medications: string;
  // Mental health
  stress: string;
  mentalHealth: string;
  socialSupport: string;
}



export default function HealthAssessmentTool() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'context' | 'assessment'>('welcome');
  const [userContext, setUserContext] = useState<UserContext>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    concerns: '',
    // Lifestyle factors
    smoking: '',
    alcohol: '',
    activity: '',
    sleep: '',
    // Medical history
    familyHistory: '',
    conditions: '',
    medications: '',
    // Mental health
    stress: '',
    mentalHealth: '',
    socialSupport: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question>(assessmentQuestions[0]);

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
    // Store the answer in userContext based on question category
    const updatedContext = { ...userContext };
    
    // Map answers to userContext fields based on question category
    switch (currentQuestion.category) {
      case 'mental_health':
        if (currentQuestion.question_id === 1) updatedContext.stress = answer;
        else if (currentQuestion.question_id === 2) updatedContext.mentalHealth = answer;
        break;
      case 'lifestyle':
        if (currentQuestion.question_id === 3) updatedContext.sleep = answer;
        else if (currentQuestion.question_id === 4) updatedContext.smoking = answer;
        else if (currentQuestion.question_id === 5) updatedContext.alcohol = answer;
        else if (currentQuestion.question_id === 6) updatedContext.activity = answer;
        break;
      case 'medical_history':
        if (currentQuestion.question_id === 7) updatedContext.familyHistory = answer;
        else if (currentQuestion.question_id === 9) updatedContext.conditions = answer;
        break;
      case 'social':
        if (currentQuestion.question_id === 11) updatedContext.socialSupport = answer;
        break;
    }
    
    setUserContext(updatedContext);
    
    // Get next question from our question bank
    const nextQuestion = getNextQuestion(currentQuestion.question_id);
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else {
      // Assessment complete - send all data to backend for analysis
      console.log('Assessment complete, sending data for analysis:', updatedContext);
      
      fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContext),
      }).then((response) => response.json())
      .then((data) => {
        console.log('Analysis results:', data);
        // Handle results - could show a results page
      })
      .catch((error) => {
        console.error('Error analyzing data:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 font-sans">
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
