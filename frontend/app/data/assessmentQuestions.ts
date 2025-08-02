export interface Question {
  question: string;
  question_id: number;
  total_questions: number;
  options: string[];
  message?: string;
  category: string;
}

export const assessmentQuestions: Question[] = [
  // Mental Health & Stress
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
  
  // Lifestyle Factors
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
  
  // Medical History
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
  
  // Diet & Nutrition
  {
    question: "How would you describe your typical diet?",
    question_id: 10,
    total_questions: 10,
    options: ["Very healthy", "Mostly healthy", "Mixed", "Somewhat unhealthy", "Very unhealthy"],
    message: "Diet plays a crucial role in overall health and disease prevention.",
    category: "lifestyle"
  },
];

export const getQuestionById = (id: number): Question | undefined => {
  return assessmentQuestions.find(q => q.question_id === id);
};

export const getNextQuestion = (currentId: number): Question | null => {
  const nextId = currentId + 1;
  const nextQuestion = getQuestionById(nextId);
  return nextQuestion || null;
}; 