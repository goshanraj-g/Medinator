'use client';

import { motion } from 'framer-motion';

interface WelcomePageProps {
  onStartAssessment: () => void;
}

export default function WelcomePage({ onStartAssessment }: WelcomePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-12">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
        >
          <span className="text-6xl">🏥</span>
        </motion.div>
        <h2 className="text-5xl font-bold text-white mb-6">
          Welcome to Healthanator
        </h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Your AI-powered health companion that assesses disease risks using public and personal data. 
          Provide as much or as little information as you're comfortable with.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartAssessment}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
      >
        Start Your Health Assessment
      </motion.button>
    </motion.div>
  );
} 