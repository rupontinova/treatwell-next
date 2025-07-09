"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const tokenParam = searchParams.get('token');
    const userParam = searchParams.get('user');
    const welcomeParam = searchParams.get('welcome');

    if (errorParam) {
      setError(errorParam);
    }

    if (tokenParam && userParam) {
      try {
        const userData = JSON.parse(userParam);
        localStorage.setItem('token', tokenParam);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (welcomeParam) {
          sessionStorage.setItem('showWelcome', 'true');
        }
        
        router.push('/');
      } catch {
        setError('Failed to process login information');
      }
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.patient));
      
      sessionStorage.setItem('showWelcome', 'true');
      
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    
    try {
      const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        setError('Google Client ID is not configured. Please check your environment variables.');
        setGoogleLoading(false);
        return;
      }
      
      console.log('Google OAuth - Redirect URI:', redirectUri);
      console.log('Google OAuth - Client ID:', clientId);
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email profile',
        access_type: 'offline',
        prompt: 'select_account',
      });

      // Redirect to Google OAuth
      window.location.href = `${oauth2Endpoint}?${params.toString()}`;
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
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
              Welcome to<br/>
              <span className="text-lime-300">TreatWell.</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Your journey to better health starts here. Access your personalized healthcare dashboard and connect with top medical professionals.
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
              Welcome Back
            </motion.h2>
            <p className="mt-2 text-gray-600">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                ❌ {error}
              </motion.div>
            )}

            {/* Google Sign-In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {googleLoading ? (
                "Redirecting to Google..."
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </motion.button>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 font-medium"
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
                    className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 font-medium"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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

              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>
            
            {/* Back to Home link */}
            <div className="text-center">
              <button
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/")}
              >
                ← Back to Home
              </button>
            </div>
            
            {/* Are you a doctor link */}
            <div className="text-center">
              <button
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/doctor/login")}
              >
                Are you a doctor?
              </button>
            </div>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 