export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Second Act
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The marketplace for used dance costumes. Buy, sell, and discover beautiful costumes for your next performance.
        </p>
        <div className="space-y-4">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <p className="text-sm text-gray-500">
            This is a simple test page to verify the app is working.
          </p>
        </div>
      </div>
    </div>
  );
}
