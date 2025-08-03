"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

interface ProcessingPageProps {
  // Optional props for customization
}

export default function ProcessingPage({}: ProcessingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingText, setLoadingText] = useState("Analyzing your responses...");

  const processingSteps = [
    "🔍 Analyzing your responses...",
    "🧠 Running ML algorithms...", 
    "📊 Processing health patterns...",
    "🤖 Consulting AI health expert...",
    "✨ Preparing your personalized assessment..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % processingSteps.length;
        setLoadingText(processingSteps[nextStep]);
        return nextStep;
      });
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center text-center font-sans"
    >
      {/* Main Loading Animation */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border-4 border-purple-500/30 rounded-full border-t-purple-500 border-r-purple-500"
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl"
        >
          <img
            src="/medinator.png"
            alt="Medinator Processing"
            className="w-24 h-24 object-contain"
          />
        </motion.div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-purple-400 rounded-full"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 100],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-6px',
              marginTop: '-6px'
            }}
          />
        ))}
      </motion.div>

      {/* Processing Text */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Processing Your Health Data
        </h2>
        <p className="text-xl text-purple-300 mb-2">
          {loadingText}
        </p>
        <p className="text-gray-400 text-sm max-w-md">
          Our advanced machine learning models are analyzing your responses and consulting 
          with AI health experts to provide you with the most accurate assessment.
        </p>
      </motion.div>

      {/* Progress Indicators */}
      <div className="flex space-x-2 mb-8">
        {processingSteps.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
            }`}
            animate={{
              scale: index === currentStep ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: index === currentStep ? Infinity : 0,
            }}
          />
        ))}
      </div>

      {/* Fun Facts */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 max-w-lg border border-gray-700/50"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-lg font-semibold text-white mb-3">
          💡 Did you know?
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Our AI system processes thousands of health patterns from the Canadian Community 
          Health Survey to provide personalized insights. This typically takes 10-30 seconds 
          to ensure the highest accuracy.
        </p>
      </motion.div>

      {/* Animated dots */}
      <motion.div
        className="flex space-x-1 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
