"use client";

import { motion } from "framer-motion";
import React from "react";

interface DetectiveReportProps {
  reportData: any;
  onRestart: () => void;
}

export default function DetectiveReport({ reportData, onRestart }: DetectiveReportProps) {
  const {
    total_questions,
    all_conditions,
    detailed_assessments,
    stopped_by_user,
    final_report
  } = reportData;

  // Use all_conditions if available, fallback to detailed_assessments for backwards compatibility
  const conditionsData = all_conditions || detailed_assessments || {};

  // Sort conditions by risk level priority
  const riskOrder = { "very high": 4, "high": 3, "medium": 2, "low": 1 };
  const sortedConditions = Object.entries(conditionsData)
    .sort(([,a]: any, [,b]: any) => {
      const riskA = riskOrder[a.risk_level as keyof typeof riskOrder] || 1;
      const riskB = riskOrder[b.risk_level as keyof typeof riskOrder] || 1;
      return riskB - riskA;
    });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "very high": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case "very high": return "Very High Risk";
      case "high": return "High Risk";
      case "medium": return "Medium Risk";
      case "low": return "Low Risk";
      default: return "Unknown Risk";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center font-sans max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-48 h-48 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 flex items-center justify-center shadow-2xl"
        >
          <img
            src="/medinator.png"
            alt="Health Genie Complete"
            className="w-32 h-32 object-contain"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Genie's Health Reading Complete!
        </motion.h1>

        {stopped_by_user && (
          <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4 mb-6">
            <p className="text-purple-200 text-lg">
              ✨ Reading completed at your request
            </p>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Investigation Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{total_questions || 0}</div>
              <div className="text-gray-300 text-sm">Questions Asked</div>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400">{sortedConditions.length}</div>
              <div className="text-gray-300 text-sm">Conditions Analyzed</div>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">
                {sortedConditions.length > 0 ? 
                  sortedConditions.filter(([,data]: any) => 
                    data.risk_level === "low" || data.risk_level === "medium"
                  ).length : 0}
              </div>
              <div className="text-gray-300 text-sm">Low-Medium Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Condition Assessments */}
      <div className="space-y-6 mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">
          🎯 Health Risk Assessment
        </h2>
        
        {sortedConditions.map(([condition, data]: any, index) => (
          <motion.div
            key={condition}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Condition Info */}
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-white mb-2 capitalize">
                  {condition.replace(/_/g, ' ')}
                </h3>
                <p className="text-gray-300 text-lg mb-4">
                  {data.comment}
                </p>
                
                {/* Indicators */}
                {data.indicators && data.indicators.length > 0 && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">
                      Key Findings:
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {data.indicators.map((indicator: string, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-blue-400 mr-2">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Risk Level Display */}
              <div className="flex flex-col items-center min-w-[200px]">
                <div className="relative w-32 h-32 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute inset-0 rounded-full border-8 border-gray-700"
                  />
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: data.risk_level === "very high" ? 1 : 
                                 data.risk_level === "high" ? 0.75 : 
                                 data.risk_level === "medium" ? 0.5 : 0.25 
                    }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="56"
                        fill="none"
                        stroke={
                          data.risk_level === "very high" ? "#ef4444" :
                          data.risk_level === "high" ? "#f97316" :
                          data.risk_level === "medium" ? "#eab308" : "#22c55e"
                        }
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - (
                          data.risk_level === "very high" ? 1 : 
                          data.risk_level === "high" ? 0.75 : 
                          data.risk_level === "medium" ? 0.5 : 0.25
                        ))}`}
                      />
                    </svg>
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${getRiskColor(data.risk_level || "medium")} capitalize`}>
                      {data.risk_level || "medium"} Risk
                    </span>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${getRiskColor(data.risk_level || "medium")}`}>
                  {getRiskLabel(data.risk_level || "medium")}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {data.status === "assessed" ? "Fully assessed" : "Initial screening"}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all duration-300 shadow-lg"
        >
          🔄 Start New Assessment
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.print()}
          className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold text-lg transition-all duration-300"
        >
          🖨️ Print Report
        </motion.button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
        <p className="text-gray-400 text-sm leading-relaxed">
          <strong className="text-gray-300">Medical Disclaimer:</strong> This AI health detective assessment is for informational purposes only and should not be considered as medical advice, diagnosis, or treatment. The analysis is based on machine learning models trained on Canadian Community Health Survey (CCHS) data. Always consult with qualified healthcare professionals for proper medical evaluation and treatment decisions.
        </p>
      </div>
    </motion.div>
  );
}
