'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HealthAssessmentTool() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'context' | 'assessment'>('welcome');
  const [userContext, setUserContext] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    concerns: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    fetch('http://127.0.0.1:5000/initial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userContext)
      }).then((response) => response.json())
      .then((data) => {
        console.log('Response from backend:', data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });

    setCurrentStep('assessment');
  };

  const handleStartAssessment = () => {
    setCurrentStep('context');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Modern Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Healthanator</h1>
                <p className="text-xs text-gray-400">AI Health Assessment</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-gray-400 text-sm">Universal Risk Assessment Tool</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {currentStep === 'welcome' && (
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
              onClick={handleStartAssessment}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
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
              <p className="text-gray-300">
                Please provide the following information for a more accurate assessment. 
                <span className="text-red-400"> *</span> indicates required fields.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Age <span className="text-red-400">*</span>
                  </label>
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-blue-400">{userContext.age || '18'}</span>
                    <span className="text-gray-400 ml-2">years old</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={userContext.age || '18'}
                    onChange={(e) => setUserContext({...userContext, age: e.target.value})}
                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((parseInt(userContext.age || '18') - 18) / 82) * 100}%, #4b5563 ${((parseInt(userContext.age || '18') - 18) / 82) * 100}%, #4b5563 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>18</span>
                    <span>100</span>
                  </div>
                  {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setUserContext({...userContext, gender})}
                        className={`px-4 py-3 rounded-xl border transition-all ${
                          userContext.gender === gender
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Height <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Feet"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        min="3"
                        max="8"
                        onChange={(e) => setUserContext({...userContext, height: e.target.value})}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Inches"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        min="0"
                        max="11"
                        onChange={(e) => setUserContext({...userContext, height: userContext.height + "'" + e.target.value})}
                      />
                    </div>
                  </div>
                  {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Weight (lbs) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your weight"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    min="50"
                    max="500"
                    onChange={(e) => setUserContext({...userContext, weight: e.target.value})}
                  />
                  {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Ethnicity <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'White/Caucasian', 'Black/African American', 'Hispanic/Latino',
                      'Asian', 'Native American', 'Pacific Islander', 'Middle Eastern',
                      'Mixed Race', 'Other', 'Prefer not to say'
                    ].map((ethnicity) => (
                      <button
                        key={ethnicity}
                        onClick={() => setUserContext({...userContext, ethnicity})}
                        className={`px-4 py-3 rounded-xl border transition-all text-left ${
                          userContext.ethnicity === ethnicity
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        {ethnicity}
                      </button>
                    ))}
                  </div>
                  {errors.ethnicity && <p className="text-red-400 text-sm mt-1">{errors.ethnicity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Primary Health Concerns (Optional)
                  </label>
                  <textarea
                    value={userContext.concerns}
                    onChange={(e) => setUserContext({...userContext, concerns: e.target.value})}
                    placeholder="Any specific health concerns or symptoms you'd like us to focus on?"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContextSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
                className="w-48 h-48 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
              >
                <span className="text-8xl">🤔</span>
              </motion.div>

              {/* Question */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-4">Question 1</h3>
                <p className="text-xl text-gray-300">
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
                    className="px-6 py-4 bg-gray-700 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-600 transition-all text-lg font-medium"
                  >
                    {level}
                  </motion.button>
                ))}
              </div>

              {/* Progress indicator */}
              <div className="mt-8 text-gray-400 text-sm">
                Question 1 of 10
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Clean Footer Disclaimer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
            <div className="text-center text-gray-400 text-sm space-y-2">
              <p className="font-medium text-gray-300">
                ⚠️ Important Disclaimer
              </p>
              <p>
                Healthanator is an AI-powered health assessment tool for informational purposes only. 
                We are not medical professionals and this tool is not a substitute for professional medical advice, 
                diagnosis, or treatment.
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Always consult with qualified healthcare providers for medical concerns. 
                Individual results may vary and should be interpreted with caution.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
