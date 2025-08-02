'use client';

import { motion } from 'framer-motion';

interface AssessmentPageProps {
  currentQuestion: {
    question: string;
    question_id: number;
    total_questions: number;
    options: string[];
    message?: string;
  };
  onAnswerSelect: (answer: string) => void;
}

export default function AssessmentPage({ currentQuestion, onAnswerSelect }: AssessmentPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-center"
    >
      {/* Akinator-style layout */}
      <div className="flex flex-col items-center">
        {/* Central Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-48 h-48 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
        >
          <span className="text-8xl">🤔</span>
        </motion.div>

        {/* Question */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-4">
            Question {currentQuestion.question_id}
          </h3>
          <p className="text-xl text-gray-300 mb-4">
            {currentQuestion.question}
          </p>
          {currentQuestion.message && (
            <p className="text-sm text-gray-400 italic">
              {currentQuestion.message}
            </p>
          )}
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
          {currentQuestion.options.map((option) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswerSelect(option)}
              className="px-6 py-4 bg-gray-700 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-600 transition-all text-lg font-medium"
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 text-gray-400 text-sm">
          Question {currentQuestion.question_id} of {currentQuestion.total_questions}
        </div>
      </div>
    </motion.div>
  );
} 