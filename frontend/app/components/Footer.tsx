export default function Footer() {
  return (
    <footer className="pb-8 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
          <div className="text-center text-gray-400 text-sm space-y-2">
            <p className="font-medium text-gray-300">
              ⚠️ Important Disclaimer ⚠️
            </p>
            <p>
              Healthinator is an AI-powered health assessment tool intended
              solely for informational purposes and is not a substitute for
              professional medical advice, diagnosis, or treatment
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Always consult qualified healthcare providers for medical
              concerns, as individual results may vary and should be interpreted
              with caution
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
