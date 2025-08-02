export default function Header() {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-1xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Healthinator</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-gray-400 text-sm">Universal Risk Assessment Tool</span>
          </div>
        </div>
      </div>
    </header>
  );
} 