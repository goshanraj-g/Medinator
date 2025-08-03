export default function Header() {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50 font-sans">
      <div className="max-w-1xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/medinator.png" 
                alt="Medinator" 
                className="w-5 h-5 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Medinator</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-gray-400 text-xs">Universal Risk Assessment Tool</span>
          </div>
        </div>
      </div>
    </header>
  );
} 