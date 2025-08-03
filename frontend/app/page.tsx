'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WelcomePage from './components/WelcomePage';
import ContextForm from './components/ContextForm';
import AssessmentPage from './components/AssessmentPage';
import DetectivePage from './components/DetectivePage';
import DetectiveReport from './components/DetectiveReport';
import { assessmentQuestions } from './data/assessmentQuestions';

interface UserContext {
  age: string;
  gender: string;
  height: string;
  weight: string;
  ethnicity: string;
  concerns: string;
}



export default function HealthAssessmentTool() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'context' | 'assessment' | 'detective' | 'report'>('welcome');
  const [userContext, setUserContext] = useState<UserContext>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    concerns: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [detectiveReport, setDetectiveReport] = useState<any>(null);

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

  const handleAssessmentSubmit = async (assessmentAnswers: { [key: string]: string }) => {
    try {
      // Combine context answers and diagnostic answers
      const combinedAnswers = { 
        ...userContext, 
        ...assessmentAnswers 
      };
      
      console.log("Sending combined answers:", combinedAnswers);
      
      const response = await fetch("http://localhost:5000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: combinedAnswers }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        console.log("Diagnosis Results:", data);
        // Store diagnosis data and move to detective phase
        setDiagnosisData(data);
        setCurrentStep('detective');
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get diagnosis. Please try again.");
    }
  };

  const handleDetectiveComplete = (report: any) => {
    setDetectiveReport(report);
    setCurrentStep('report');
  };

  const handleRestart = () => {
    setCurrentStep('welcome');
    setUserContext({
      age: '',
      gender: '',
      height: '',
      weight: '',
      ethnicity: '',
      concerns: ''
    });
    setErrors({});
    setDiagnosisData(null);
    setDetectiveReport(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black font-sans flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-4 font-sans overflow-hidden">
        {currentStep === 'welcome' && (
          <div className="h-full flex items-center justify-center">
            <WelcomePage onStartAssessment={handleStartAssessment} />
          </div>
        )}

        {currentStep === 'context' && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <ContextForm
              userContext={userContext}
              setUserContext={setUserContext}
              errors={errors}
              onBack={() => setCurrentStep('welcome')}
              onSubmit={handleContextSubmit}
            />
          </div>
        )}

        {currentStep === 'assessment' && (
          <div className="h-full flex items-center justify-center">
            <AssessmentPage
              questions={assessmentQuestions}
              onSubmit={handleAssessmentSubmit}
            />
          </div>
        )}

        {currentStep === 'detective' && diagnosisData && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <DetectivePage
              diagnosisData={diagnosisData.predictions || diagnosisData.risk_factors}
              userAssessment={diagnosisData.user_assessment || userContext}
              onComplete={handleDetectiveComplete}
            />
          </div>
        )}

        {currentStep === 'report' && detectiveReport && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <DetectiveReport
              reportData={detectiveReport}
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
