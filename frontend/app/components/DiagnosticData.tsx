import React, { useState, useEffect } from "react";
import ContextForm from "./ContextForm";
import AssessmentPage from "./AssessmentPage";

export default function DiagnosticFlow() {
  const [currentStep, setCurrentStep] = useState<"context" | "assessment">("context");
  const [answers, setAnswers] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    ethnicity: "",
    concerns: "",
  });

  const [diagnosticAnswers, setDiagnosticAnswers] = useState<{ [key: string]: string }>({});

  // Define questions directly here to ensure they work
  const assessmentQuestions = [
    {
      question: "How would you rate your current stress level?",
      question_id: 1,
      total_questions: 10,
      options: ["Very Low", "Low", "Moderate", "High", "Very High"],
      message: "These first 10 questions help us understand your health profile better. Understanding your stress levels helps us assess your overall health risk.",
      category: "mental_health"
    },
    {
      question: "How would you describe your overall mood in the past month?",
      question_id: 2,
      total_questions: 10,
      options: ["Excellent", "Good", "Fair", "Poor", "Very Poor"],
      message: "Mental health is closely linked to physical health outcomes",
      category: "mental_health"
    },
    {
      question: "How many hours of sleep do you typically get per night?",
      question_id: 3,
      total_questions: 10,
      options: ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"],
      message: "Sleep quality and duration are important indicators of health",
      category: "lifestyle"
    },
    {
      question: "What is your current smoking status?",
      question_id: 4,
      total_questions: 10,
      options: ["Never smoked", "Former smoker", "Occasional smoker", "Regular smoker", "Heavy smoker"],
      message: "Smoking is one of the most significant risk factors for many diseases",
      category: "lifestyle"
    },
    {
      question: "How often do you consume alcoholic beverages?",
      question_id: 5,
      total_questions: 10,
      options: ["Never", "Rarely (1-2 times/month)", "Occasionally (1-2 times/week)", "Regularly (3-4 times/week)", "Daily"],
      message: "Alcohol consumption patterns can affect various health outcomes",
      category: "lifestyle"
    },
    {
      question: "How would you describe your physical activity level?",
      question_id: 6,
      total_questions: 10,
      options: ["Sedentary (no exercise)", "Light (1-2 days/week)", "Moderate (3-4 days/week)", "Active (5-6 days/week)", "Very active (daily exercise)"],
      message: "Physical activity is crucial for maintaining good health",
      category: "lifestyle"
    },
    {
      question: "Do you have any family history of heart disease?",
      question_id: 7,
      total_questions: 10,
      options: ["No family history", "One parent", "Both parents", "Siblings", "Multiple family members"],
      message: "Family history is an important predictor of cardiovascular risk",
      category: "medical_history"
    },
    {
      question: "Do you have any family history of diabetes?",
      question_id: 8,
      total_questions: 10,
      options: ["No family history", "One parent", "Both parents", "Siblings", "Multiple family members"],
      message: "Diabetes has a strong genetic component",
      category: "medical_history"
    },
    {
      question: "Have you been diagnosed with high blood pressure?",
      question_id: 9,
      total_questions: 10,
      options: ["No", "Borderline", "Yes, controlled with medication", "Yes, uncontrolled", "Don't know"],
      message: "Hypertension is a major risk factor for cardiovascular disease",
      category: "medical_history"
    },
    {
      question: "How would you describe your typical diet?",
      question_id: 10,
      total_questions: 10,
      options: ["Very healthy", "Mostly healthy", "Mixed", "Somewhat unhealthy", "Very unhealthy"],
      message: "Diet plays a crucial role in overall health and disease prevention.",
      category: "lifestyle"
    }
  ];

  // Debug logging
  console.log("DiagnosticFlow - Questions check:", {
    questionsLength: assessmentQuestions?.length,
    firstQuestion: assessmentQuestions?.[0]?.question,
    currentStep: currentStep
  });

  const handleSubmit = async (assessmentAnswers: { [key: string]: string }) => {
    try {
      // Combine context answers and diagnostic answers
      const combinedAnswers = { 
        ...answers, 
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
        // TODO: Display results to user
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to get diagnosis. Please try again.");
    }
  };

  const handleContextSubmit = () => {
    // Move from context form to assessment questions
    setCurrentStep("assessment");
  };

  const handleBack = () => {
    if (currentStep === "assessment") {
      setCurrentStep("context");
    } else {
      // Handle going back from context form
      console.log("Back from context form");
    }
  };

  return (
    <div>
      {currentStep === "context" && (
        <ContextForm
          userContext={answers}
          setUserContext={setAnswers}
          errors={{}}
          onBack={handleBack}
          onSubmit={handleContextSubmit}
        />
      )}
      
      {currentStep === "assessment" && (
        <AssessmentPage
          questions={assessmentQuestions}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
