'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HealthAssessmentTool() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'context' | 'assessment'>('welcome');
  const [userContext, setUserContext] = useState({
    age: '',
    gender: '',
    lifestyle: '',
    concerns: '',
    familyHistory: ''
  });

  const handleContextSubmit = () => {
    setCurrentStep('assessment');
  };

  const handleStartAssessment = () => {
    setCurrentStep('context');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold text-white">Healthanator</h1>
            </div>
            <div className="text-sm text-white/80">
              Universal Risk Assessment Tool
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
              >
                <span className="text-6xl">🏥</span>
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to Healthanator
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Your AI-powered health companion that assesses disease risks using public and personal data. 
                Provide as much or as little information as you're comfortable with.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartAssessment}
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Health Assessment
            </motion.button>
          </motion.div>
        )}

        {currentStep === 'context' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Help Us Personalize Your Assessment
              </h2>
              <p className="text-white/90">
                The more context you provide, the more accurate your assessment will be. 
                You can skip any questions you're not comfortable answering.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Age Range
                  </label>
                  <select
                    value={userContext.age}
                    onChange={(e) => setUserContext({...userContext, age: e.target.value})}
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-gray-800"
                  >
                    <option value="">Select age range</option>
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36-45">36-45 years</option>
                    <option value="46-55">46-55 years</option>
                    <option value="56-65">56-65 years</option>
                    <option value="65+">65+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setUserContext({...userContext, gender})}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          userContext.gender === gender
                            ? 'bg-white text-blue-600 border-white'
                            : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Lifestyle (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Sedentary', 'Moderately active', 'Very active', 'Athlete',
                      'Smoker', 'Non-smoker', 'Social drinker', 'Non-drinker'
                    ].map((lifestyle) => (
                      <button
                        key={lifestyle}
                        onClick={() => {
                          const current = userContext.lifestyle;
                          const updated = current.includes(lifestyle)
                            ? current.replace(lifestyle, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '')
                            : current ? `${current}, ${lifestyle}` : lifestyle;
                          setUserContext({...userContext, lifestyle: updated});
                        }}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          userContext.lifestyle.includes(lifestyle)
                            ? 'bg-white text-blue-600 border-white'
                            : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                        }`}
                      >
                        {lifestyle}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Primary Health Concerns
                  </label>
                  <textarea
                    value={userContext.concerns}
                    onChange={(e) => setUserContext({...userContext, concerns: e.target.value})}
                    placeholder="Any specific health concerns or symptoms you'd like us to focus on?"
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-800"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Family History (Optional)
                  </label>
                  <textarea
                    value={userContext.familyHistory}
                    onChange={(e) => setUserContext({...userContext, familyHistory: e.target.value})}
                    placeholder="Any relevant family medical history?"
                    className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none text-gray-800"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="flex-1 px-6 py-3 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContextSubmit}
                    className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'assessment' && (
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
                className="w-48 h-48 bg-white rounded-full mb-8 flex items-center justify-center shadow-2xl"
              >
                <span className="text-8xl">🤔</span>
              </motion.div>

              {/* Question */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 max-w-2xl border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">Question 1</h3>
                <p className="text-xl text-white/90">
                  How would you rate your current stress level?
                </p>
              </div>

              {/* Answer Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map((level) => (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all text-lg font-medium"
                  >
                    {level}
                  </motion.button>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="mt-8 text-white/70 text-sm">
                Question 1 of 10
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
