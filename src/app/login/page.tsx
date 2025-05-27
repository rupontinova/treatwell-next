"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Login failed! Please register first.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
        {error && (
          <div className="mb-4 text-red-600 text-center">❌ {error}</div>
        )}
        <div className="mb-4">
          <label className="block mb-1  text-gray-600 font-medium">Username</label>
          <input
            type="text"
            className="w-full px-3 py-2 border text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1  text-gray-600 font-medium">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-center">
  <button
    type="submit"
    className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-4"
    disabled={loading}
  >
    {loading ? "Logging in..." : "Login"}
  </button>
</div>
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot password?
          </a>
        </div>
        <div className="text-center mt-4">
          <a
            href="/register"
            className="text-blue-500 hover:underline text-sm font-medium"
          >
            Don't have an account? Register now!
          </a>
        </div>
        <div className="text-center mt-4">
          <a href="/" className="text-gray-500 hover:underline text-sm">Return to Homepage</a>
        </div>
      </form>
    </div>
  );
} 