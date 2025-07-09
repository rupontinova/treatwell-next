"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Eye, EyeOff, Briefcase } from "lucide-react";

export default function DoctorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bmdcNumber, setBmdcNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleValidate = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Validation failed');
      
      setSuccess(data.message);
      setStep(2); // Move to next step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, bmdcNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('welcomeMessage', `Welcome, Dr. ${data.doctor.name}`);
      router.push('/doctor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleValidate();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight font-sans">
              Doctor Portal<br/>
              <span className="text-lime-300">TreatWell.</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Access your professional dashboard to manage appointments and connect with patients.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-gray-900"
            >
              Doctor Sign In
            </motion.h2>
            <p className="mt-2 text-gray-600">
              {step === 1 ? 'Please sign in to your professional account' : 'Final verification step'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                ❌ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
              >
                ✅ {success}
              </motion.div>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                      <span className="ml-1 text-xs font-medium">
                        {showPassword ? "HIDE" : "SHOW"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BMDC Registration Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                    value={bmdcNumber}
                    onChange={e => setBmdcNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="text-right">
              <a href="/doctor/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">Forgot password?</a>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (step === 1 ? 'Validating...' : 'Logging in...') : (step === 1 ? 'Validate' : 'Sign in')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
            
            {/* Back to Home link */}
            <div className="text-center">
              <button
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/")}
              >
                ← Back to Home
              </button>
            </div>
            
            {/* Are you a patient link */}
            <div className="text-center">
              <button
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/login")}
              >
                Are you a patient?
              </button>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Don't have a professional account?</span></div>
              </div>
              <div className="mt-6">
                <a href="/doctor/register" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">Sign Up as a Doctor</a>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 