"use client";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Email not found!");
      } else {
        setMessage("Reset link sent to your email!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Forgot Password</h2>
        <p className="mb-4 text-gray-600 text-center text-sm">
          Enter your registered email, and we'll send you a link to reset your password.
        </p>
        {message && (
          <div className="mb-4 text-green-600 text-center">✅ {message}</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 text-center">❌ {error}</div>
        )}
        <div className="mb-4">
          <label className="block mb-1 text-gray-600 font-medium">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-4"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <div className="text-center">
          <a href="/login" className="text-blue-500 hover:underline text-sm">
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
} 