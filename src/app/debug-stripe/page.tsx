"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugStripePage() {
  const { user } = useAuth();
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    if (!user?.id) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/debug-stripe-detailed", {
        headers: {
          "x-user-id": user.id,
        },
      });
      const data = await response.json();
      setDebugResult(data);
    } catch (error) {
      setDebugResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testStripeConnect = async () => {
    if (!user?.id) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: {
          "x-user-id": user.id,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setDebugResult({ stripeConnectResult: data, status: response.status });
    } catch (error) {
      setDebugResult({ stripeConnectError: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Stripe Connect Debug
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p><strong>User ID:</strong> {user?.id || "Not logged in"}</p>
          <p><strong>Email:</strong> {user?.email || "Not available"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Environment</h2>
            <button
              onClick={runDebug}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Running..." : "Run Debug Check"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Stripe Connect</h2>
            <button
              onClick={testStripeConnect}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Create Account"}
            </button>
          </div>
        </div>

        {debugResult && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
