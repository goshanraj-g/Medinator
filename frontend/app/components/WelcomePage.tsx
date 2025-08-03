"use client";

import { motion } from "framer-motion";

interface WelcomePageProps {
  onStartAssessment: () => void;
}

export default function WelcomePage({ onStartAssessment }: WelcomePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center font-sans"
    >
      <div className="mb-12">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl overflow-hidden"
        >
          <img
            src="/medinator.png"
            alt="Medinator"
            className="w-20 h-20 object-contain"
          />
        </motion.div>
        <h2 className="text-5xl font-bold text-white mb-6">
          Welcome to the Medinator!
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Your personal AI-powered health companion, designed to assess disease
          risks using public and personal data, share as much or as little
          information as you’re comfortable with!
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartAssessment}
        className=" bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:from-blue-600 hover:to-cyan-600 hover:scale-105 transition-all duration-300 ease-out"
      >
        Start Your Health Assessment
      </motion.button>
    </motion.div>
  );
}
