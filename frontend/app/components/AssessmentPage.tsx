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
      className="text-center font-sans"
    >
      {/* Akinator-style layout */}
      <div className="flex flex-col items-center">
        {/* Central Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-48 h-48 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-8 flex items-center justify-center shadow-2xl overflow-hidden"
        >
          <img 
            src="/medinator.png" 
            alt="Medinator" 
            className="w-32 h-32 object-contain"
          />
        </motion.div>

        {/* Question */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl border border-gray-700/50">
                     {currentQuestion.question_id === 1 && (
             <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
               <p className="text-blue-200 text-sm font-medium">
                 📋 <strong>Diagnostic Phase:</strong> We'll ask 10 questions to understand your health profile and provide personalized insights.
               </p>
             </div>
           )}
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
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => onAnswerSelect(option)}
               className="px-6 py-4 bg-gray-700 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-600 hover:border-gray-500 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out text-lg font-medium"
             >
               {option}
             </motion.button>
           ))}
         </div>

                 {/* Progress indicator */}
         <div className="mt-8 text-gray-400 text-sm">
           <div>
             <p>Diagnostic Question {currentQuestion.question_id} of 10</p>
             <p className="text-xs text-gray-500 mt-1">Gathering your health profile...</p>
           </div>
         </div>
      </div>
    </motion.div>
  );
} 