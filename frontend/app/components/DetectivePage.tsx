"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

interface DetectiveResponse {
  question?: string;
  options?: string[];
  current_condition?: string;
  questions_asked?: number;
  session_id?: string;
  can_stop?: boolean;
  assessment?: {
    confidence: number;
    comment: string;
    indicators: string[];
  };
  moving_to_next?: boolean;
  next_question?: any;
  final_report?: boolean;
  conditions_assessed?: any;
  all_assessments?: any;
  total_conditions?: number;
  conditions_completed_once?: number;
  error?: string;
}

interface DetectivePageProps {
  diagnosisData: any;
  userAssessment: any;
  onComplete: (report: any) => void;
}

export default function DetectivePage({
  diagnosisData,
  userAssessment,
  onComplete,
}: DetectivePageProps) {
  const [sessionId, setSessionId] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [currentCondition, setCurrentCondition] = useState<string>("");
  const [questionsAsked, setQuestionsAsked] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAssessment, setShowAssessment] = useState<boolean>(false);
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [investigationHistory, setInvestigationHistory] = useState<any[]>([]);
  const [allAssessments, setAllAssessments] = useState<any>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Start the detective investigation
  useEffect(() => {
    startDetective();
  }, []);

  const startDetective = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/start-detective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diagnosis_data: diagnosisData,
          user_assessment: userAssessment,
        }),
      });

      const data: DetectiveResponse = await response.json();
      
      if (data.error) {
        console.error("Detective error:", data.error);
        return;
      }

      setSessionId(data.session_id || "");
      setCurrentQuestion(data.question || "");
      setQuestionOptions(data.options || []);
      setCurrentCondition(data.current_condition || "");
      setQuestionsAsked(data.questions_asked || 0);
      setIsLoading(false);
      
      // Simulate typing effect
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
      
    } catch (error) {
      console.error("Failed to start detective:", error);
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (selectedAnswer: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/continue-detective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer: selectedAnswer,
        }),
      });

      const data: DetectiveResponse = await response.json();
      
      if (data.error) {
        console.error("Detective error:", data.error);
        return;
      }

      // Check if we're moving to next condition
      if (data.moving_to_next && data.assessment) {
        setCurrentAssessment(data.assessment);
        setShowAssessment(true);
        setInvestigationHistory(prev => [...prev, {
          condition: currentCondition,
          assessment: data.assessment
        }]);
        
        // Update all assessments if provided
        if (data.all_assessments) {
          setAllAssessments(data.all_assessments);
        }
        
        // After showing assessment, move to next question
        setTimeout(() => {
          setShowAssessment(false);
          setCurrentAssessment(null);
          setCurrentQuestion(data.next_question?.question || "");
          setQuestionOptions(data.next_question?.options || []);
          setCurrentCondition(data.next_question?.current_condition || "");
          setQuestionsAsked(data.next_question?.questions_asked || 0);
          setIsLoading(false);
          
          // Simulate typing for next question
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1500);
        }, 3000);
        
      } else if (data.final_report) {
        // Investigation complete
        onComplete({
          ...data,
          investigation_history: investigationHistory
        });
        
      } else {
        // Continue with next question
        setCurrentQuestion(data.question || "");
        setQuestionOptions(data.options || []);
        setCurrentCondition(data.current_condition || "");
        setQuestionsAsked(data.questions_asked || 0);
        
        // Update all assessments if provided
        if (data.all_assessments) {
          setAllAssessments(data.all_assessments);
        }
        
        setIsLoading(false);
        
        // Simulate typing effect
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
      
    } catch (error) {
      console.error("Failed to continue detective:", error);
      setIsLoading(false);
    }
  };

  const handleStopInvestigation = async () => {
    try {
      const response = await fetch("http://localhost:5000/stop-detective", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const data = await response.json();
      onComplete({
        ...data,
        investigation_history: investigationHistory,
        stopped_early: true
      });
      
    } catch (error) {
      console.error("Failed to stop detective:", error);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center font-sans"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
          >
            <img
              src="/medinator.png"
              alt="Health Genie"
              className="w-32 h-32 object-contain"
            />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Preparing Magic Crystal Ball...
          </h2>
          <p className="text-gray-300 text-lg">
            The health genie is awakening to read your patterns
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center font-sans"
    >
      <AnimatePresence mode="wait">
        {showAssessment && currentAssessment ? (
          // Show Akinator-style assessment
          <motion.div
            key="assessment"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 20px rgba(168, 85, 247, 0.4)", "0 0 40px rgba(168, 85, 247, 0.8)", "0 0 20px rgba(168, 85, 247, 0.4)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
            >
              <img
                src="/medinator.png"
                alt="Health Genie"
                className="w-32 h-32 object-contain"
              />
            </motion.div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl border border-purple-500/50">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-purple-200 mb-6"
              >
                {currentAssessment.comment}
              </motion.h3>
              
              <div className="bg-gray-800/50 rounded-xl p-6 mb-4">
                <h4 className="text-xl font-semibold text-white mb-3">
                  ✨ Health Pattern Discovery
                </h4>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-4xl font-bold text-purple-300">
                    {currentAssessment.confidence}%
                  </div>
                  <div className="ml-4 text-gray-300">
                    confident about this pattern
                  </div>
                </div>
                {currentAssessment.indicators && (
                  <div className="text-left">
                    <p className="text-sm text-gray-400 mb-2">🔍 What I noticed:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {currentAssessment.indicators.map((indicator: string, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-purple-400 mr-2">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <p className="text-purple-200 text-lg">
                Moving to investigate the next condition...
              </p>
            </div>
          </motion.div>
        ) : (
          // Show question interface
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            {/* Detective Avatar */}
            <motion.div
              animate={{ 
                y: isTyping ? [-5, 5, -5] : [0],
              }}
              transition={{ 
                duration: isTyping ? 0.6 : 0,
                repeat: isTyping ? Infinity : 0
              }}
              className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
            >
              <img
                src="/medinator.png"
                alt="Health Genie"
                className="w-32 h-32 object-contain"
              />
            </motion.div>

            {/* Question Display */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-3xl border border-gray-700/50 min-h-[300px] flex flex-col justify-center">
              <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400/30 rounded-xl">
                <p className="text-purple-200 text-sm font-medium">
                  � <strong>Health Genie Investigation:</strong> I'm trying to guess your health patterns!
                  {investigationHistory.length > 0 && (
                    <span className="ml-2 text-purple-300">
                      ({investigationHistory.length} area{investigationHistory.length !== 1 ? 's' : ''} already explored)
                    </span>
                  )}
                </p>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">
                🤔 Question {questionsAsked}
              </h3>
              
              <div className="text-left bg-gray-700/30 rounded-xl p-6 mb-6">
                {isTyping ? (
                  <div className="flex items-center">
                    <span className="text-gray-300 text-lg">The detective is thinking</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-2 text-purple-400 text-2xl"
                    >
                      ...
                    </motion.span>
                  </div>
                ) : (
                  <p className="text-xl text-gray-200 leading-relaxed">
                    {currentQuestion}
                  </p>
                )}
              </div>

              {/* Answer Input */}
              {!isTyping && questionOptions && questionOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-center mb-4">Choose your answer:</p>
                  
                  {/* Multiple Choice Buttons */}
                  <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                    {questionOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSubmit(option)}
                        disabled={isLoading}
                        className="p-4 bg-gray-700 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300 text-left border border-gray-600 hover:border-purple-500"
                      >
                        <span className="text-purple-400 mr-3">•</span>
                        {option}
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStopInvestigation}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold transition-all duration-300"
                    >
                      🛑 Stop & Get Results
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Progress & History */}
            <div className="text-gray-400 text-sm text-center">
              <p>🔮 Questions Asked: {questionsAsked}</p>
              <p className="text-xs text-gray-500 mt-1">
                The genie is learning about your health patterns...
              </p>
              
              {/* Current Assessments Display */}
              {Object.keys(allAssessments).length > 0 && (
                <div className="mt-6 max-w-4xl mx-auto">
                  <p className="text-sm text-purple-300 mb-4">🔮 Genie's Current Readings:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(allAssessments).map(([condition, assessment]: [string, any]) => (
                      <div key={condition} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                        <div className="text-center">
                          <h4 className="text-white font-semibold text-sm mb-2 capitalize">
                            {condition.replace(/_/g, ' ')}
                          </h4>
                          <div className="flex items-center justify-center mb-2">
                            <div className="text-2xl font-bold text-purple-300">
                              {assessment.confidence}%
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 italic">
                            {assessment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {investigationHistory.length > 0 && (
                <div className="mt-4 max-w-2xl">
                  <p className="text-xs text-gray-500 mb-2">✨ Areas already explored:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {investigationHistory.map((item, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg px-3 py-1 text-xs">
                        <span className="text-purple-300">Area {idx + 1}</span>: 
                        <span className="text-white ml-1">{item.assessment.confidence}% confident</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
