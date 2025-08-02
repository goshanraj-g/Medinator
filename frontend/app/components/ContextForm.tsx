"use client";

import { motion } from "framer-motion";

interface UserContext {
  age: string;
  gender: string;
  height: string;
  weight: string;
  ethnicity: string;
  concerns: string;
  // Lifestyle factors
  smoking: string;
  alcohol: string;
  activity: string;
  sleep: string;
  // Medical history
  familyHistory: string;
  conditions: string;
  medications: string;
  // Mental health
  stress: string;
  mentalHealth: string;
  socialSupport: string;
}

interface ContextFormProps {
  userContext: UserContext;
  setUserContext: (context: UserContext) => void;
  errors: { [key: string]: string };
  onBack: () => void;
  onSubmit: () => void;
}

export default function ContextForm({
  userContext,
  setUserContext,
  errors,
  onBack,
  onSubmit,
}: ContextFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto font-sans"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Help Us Personalize Your Assessment
        </h2>
        <p className="text-gray-300">
          Please provide the following information for a more accurate
          assessment.
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Age <span className="text-red-400 font-mono">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter your age"
              value={userContext.age}
              onChange={(e) =>
                setUserContext({ ...userContext, age: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-all duration-200 text-center text-lg"
              min="18"
              max="100"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>min - 18</span>
              <span>max - 100</span>
            </div>
            {errors.age && (
              <p className="text-orange-400 text-sm mt-1">{errors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Gender <span className="text-red-400 font-mono">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Male", "Female", "Non-binary", "Prefer not to say"].map(
                (gender) => (
                  <button
                    key={gender}
                    onClick={() => setUserContext({ ...userContext, gender })}
                    className={`px-4 py-3 rounded-xl border transition-all duration-300 ease-out transform hover:scale-105 ${
                      userContext.gender === gender
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                        : "bg-gray-700/70 text-gray-300 border-gray-600 hover:bg-gray-600/70 hover:border-gray-500 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    {gender}
                  </button>
                )
              )}
            </div>
            {errors.gender && (
              <p className="text-orange-400 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Height <span className="text-red-400 font-mono">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Feet"
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-all duration-200"
                  min="3"
                  max="8"
                  onChange={(e) =>
                    setUserContext({ ...userContext, height: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Inches"
                  className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-all duration-200"
                  min="0"
                  max="11"
                  onChange={(e) =>
                    setUserContext({
                      ...userContext,
                      height: userContext.height + "'" + e.target.value,
                    })
                  }
                />
              </div>
            </div>
            {errors.height && (
              <p className="text-orange-400 text-sm mt-1">{errors.height}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Weight (lbs) <span className="text-red-400 font-mono">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter your weight"
              className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 transition-all duration-200"
              min="50"
              max="500"
              onChange={(e) =>
                setUserContext({ ...userContext, weight: e.target.value })
              }
            />
            {errors.weight && (
              <p className="text-orange-400 text-sm mt-1">{errors.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Ethnicity <span className="text-red-400 font-mono">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                "White/Caucasian",
                "Black/African American",
                "Hispanic/Latino",
                "Asian",
                "Native American",
                "Pacific Islander",
                "Middle Eastern",
                "Mixed Race",
                "Other",
                "Prefer not to say",
              ].map((ethnicity) => (
                <button
                  key={ethnicity}
                  onClick={() => setUserContext({ ...userContext, ethnicity })}
                  className={`px-4 py-3 rounded-xl border transition-all duration-300 ease-out transform hover:scale-105 text-left ${
                    userContext.ethnicity === ethnicity
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                      : "bg-gray-700/70 text-gray-300 border-gray-600 hover:bg-gray-600/70 hover:border-gray-500 hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {ethnicity}
                </button>
              ))}
            </div>
            {errors.ethnicity && (
              <p className="text-orange-400 text-sm mt-1">{errors.ethnicity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Primary Health Concerns{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              value={userContext.concerns}
              onChange={(e) =>
                setUserContext({ ...userContext, concerns: e.target.value })
              }
              placeholder="Any specific health concerns or symptoms you'd like us to focus on?"
              className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-white placeholder-gray-400 transition-all duration-200"
              rows={3}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Fields marked with <span className="text-red-400 font-mono">*</span>{" "}
            are required
          </p>

          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-700/70 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-600/70 hover:border-gray-500 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out transform"
            >
              Back
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/25 hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 ease-out transform"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
