export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Test Page Working!
        </h1>
        <p className="text-gray-600">
          If you can see this, your Next.js app is working correctly.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">
            Environment: {process.env.NODE_ENV}
          </p>
        </div>
      </div>
    </div>
  );
}
