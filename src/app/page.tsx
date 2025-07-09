"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Stethoscope, Calendar, HeartPulse, User, Star, ShieldCheck, LogOut, Send, Hourglass } from 'lucide-react';
import { Notification } from '@/components/Notification';
import { IDoctor } from "@/models/Doctor";
import { IReview } from "@/models/Review";

const LoginModal = ({ feature, onClose, onConfirm }: { feature: string, onClose: () => void, onConfirm: () => void }) => (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-95 hover:scale-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please log in or create an account to access the "{feature}" feature.</p>
            <div className="flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    Cancel
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Go to Login
                </button>
            </div>
        </div>
    </div>
);

// Removed hard-coded specialities - now loaded dynamically

interface ReviewFormProps {
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewMessage: string;
  setReviewMessage: (message: string) => void;
  reviewError: string;
  setReviewError: (error: string) => void;
  reviewLoading: boolean;
  handleSubmitReview: () => void;
}

const StarRating = ({ rating, onRatingChange, readonly = false }: { rating: number, onRatingChange?: (rating: number) => void, readonly?: boolean }) => (
  <div className="flex justify-center mb-4">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${
          !readonly ? 'cursor-pointer hover:text-yellow-400' : ''
        }`}
        onClick={() => !readonly && onRatingChange && onRatingChange(i + 1)}
      />
    ))}
  </div>
);

const ReviewForm = ({ 
  reviewRating, 
  setReviewRating, 
  reviewMessage, 
  setReviewMessage, 
  reviewError, 
  setReviewError, 
  reviewLoading, 
  handleSubmitReview 
}: ReviewFormProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col justify-between">
    <div className="flex-1 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Write a Review</h3>
      
      {reviewError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-600 text-sm">{reviewError}</p>
        </div>
      )}
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
      </div>
      
      <div className="flex-1 flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
        <textarea
          value={reviewMessage}
          onChange={(e) => setReviewMessage(e.target.value)}
          placeholder="Share your experience with TreatWell..."
          className="w-full flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {reviewMessage.length}/500
        </div>
      </div>
    </div>
    
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => {
          setReviewError("");
          setReviewRating(0);
          setReviewMessage("");
        }}
        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
      >
        Clear
      </button>
      <button
        onClick={handleSubmitReview}
        disabled={reviewLoading || !reviewRating || !reviewMessage.trim()}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {reviewLoading ? (
          "Submitting..."
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit
          </>
        )}
      </button>
    </div>
  </div>
);

export default function Home() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [modalInfo, setModalInfo] = useState<{ feature: string; visible: boolean } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchSpeciality, setSearchSpeciality] = useState("");
  const [featuredDoctors, setFeaturedDoctors] = useState<IDoctor[]>([]);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback parameters
    const tokenParam = searchParams.get('token');
    const userParam = searchParams.get('user');
    const welcomeParam = searchParams.get('welcome');

    if (tokenParam && userParam) {
      try {
        const userData = JSON.parse(userParam);
        localStorage.setItem('token', tokenParam);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (welcomeParam) {
          sessionStorage.setItem('showWelcome', 'true');
        }
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('user');
        url.searchParams.delete('welcome');
        window.history.replaceState({}, '', url.toString());
        
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to process OAuth callback:', err);
      }
    }

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const shouldShowWelcome = sessionStorage.getItem('showWelcome');
    if (shouldShowWelcome === 'true') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.fullName) {
          setWelcomeMessage(`Welcome back, ${user.fullName}! 👋`);
          setShowWelcome(true);
          sessionStorage.removeItem('showWelcome');
        }
      }
    }

    const fetchFeaturedDoctors = async () => {
      try {
        const res = await fetch('/api/doctors?limit=4');
        if (res.ok) {
          const data = await res.json();
          setFeaturedDoctors(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured doctors", error);
      }
    };

    const fetchSpecialities = async () => {
      try {
        const res = await fetch('/api/doctors/specialities');
        if (res.ok) {
          const data = await res.json();
          setSpecialities(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch specialities", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };

    const fetchStatistics = async () => {
      try {
        setStatisticsLoading(true);
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStatistics(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setStatisticsLoading(false);
      }
    };

    fetchFeaturedDoctors();
    fetchSpecialities();
    fetchReviews();
    fetchStatistics();
  }, [searchParams]);

  // Auto-close welcome notification after 5 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleSearch = () => {
    const query = new URLSearchParams({
        name: searchName,
        speciality: searchSpeciality,
    }).toString();

    const path = `/doctor-list?${query}`;

    requireLogin("Doctor List", path);
  };

  const requireLogin = (feature: string, path?: string) => {
    if (isLoggedIn) {
        router.push(path || '/');
    } else {
        setModalInfo({ feature, visible: true });
    }
  };
  
  const handleModalConfirm = () => {
    setModalInfo(null);
    router.push("/login");
  };

  const handleModalClose = () => {
    setModalInfo(null);
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewMessage.trim()) {
      setReviewError("Please provide both rating and review message");
      return;
    }

    setReviewError("");
    setReviewLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          reviewMessage: reviewMessage.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReviewSuccess("Review submitted successfully!");
        setReviewRating(0);
        setReviewMessage("");
        // Refresh reviews
        const reviewsRes = await fetch('/api/reviews');
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data);
        }
        setTimeout(() => setReviewSuccess(""), 3000);
      } else {
        setReviewError(data.message || "Failed to submit review");
      }
    } catch (error) {
      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const FeatureCard = ({ icon, title, children, onClick }: { icon: React.ReactNode, title: string, children: React.ReactNode, onClick?: () => void }) => (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">{children}</p>
    </div>
  );

  const StatisticCard = ({ value, label }: { value: number, label: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Format numbers with + suffix
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k+";
      }
      return num + "+";
    };

    // Intersection Observer to trigger animation when visible
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        },
        { threshold: 0.5 }
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => observer.disconnect();
    }, [isVisible]);

    // Counting animation effect
    useEffect(() => {
      if (isVisible && value > 0) {
        setIsAnimating(true);
        let startTime: number;
        const duration = 2000; // 2 seconds animation
        const startValue = 0;
        const endValue = value;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
          
          setDisplayValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(animate);
      }
    }, [isVisible, value]);

          return (
        <div ref={cardRef} className="text-center">
          <div className={`text-4xl md:text-5xl font-bold text-gray-900 mb-2 transition-all duration-300 ${isAnimating ? 'animate-pulse scale-105' : ''}`}>
            {formatNumber(displayValue)}
          </div>
          <div className="text-sm md:text-base text-gray-500 font-medium">
            {label}
          </div>
        </div>
      );
  };
  
  const HowItWorksStep = ({ icon, number, title, description }: { icon: React.ReactNode, number: string, title: string, description: string }) => (
      <div className="flex-1 flex flex-col items-center text-center p-6 z-10">
        <div className="relative mb-4">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4 border-4 border-white shadow-lg">
                {icon}
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold border-2 border-white">
                {number}
            </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 max-w-xs">{description}</p>
      </div>
  );



  const TestimonialCard = ({ quote, name, role, rating }: { quote: string, name: string, role: string, rating: number }) => (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <StarRating rating={rating} readonly={true} />
        <p className="text-gray-600 italic mb-6">"{quote}"</p>
        <div className="font-semibold text-gray-800">{name}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
  );



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Notification 
        message={welcomeMessage}
        isVisible={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      {modalInfo?.visible && (
        <LoginModal 
            feature={modalInfo.feature} 
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
        />
      )}



      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="text-3xl font-bold text-blue-600 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          TreatWell
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Find a Doctor", "/doctor-list")}>
            Find a Doctor
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Appointments", "/appointments")}>
            Appointments
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Medical History", "/medical-history")}>
            Medical History
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Health Tracker", "/health-tracker")}>
            Health Tracker
          </button>
        </div>
        <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                    onClick={() => router.push("/profile")}
                >
                    Profile
                </button>
                <button
                    className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      router.push('/');
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="hidden md:inline-block text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                  onClick={() => router.push("/doctor")}
                >
                  Are you a doctor?
                </button>
                <button
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                    onClick={() => router.push("/login")}
                >
                    Login
                </button>
              </>
            )}
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center flex-1 py-20 md:py-28 relative text-center">
        <div className="absolute inset-0 bg-[url('/medical-bg.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-gray-900/80"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight text-center">
            Your Health, Our Priority.<br/>
            <span className="text-lime-300">TreatWell.</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl text-center mx-auto">
            Effortlessly find top-rated doctors, manage appointments, and track your wellness journey—all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
              onClick={scrollToServices}
            >
              Explore Our Services
            </button>
            <button
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 border border-gray-200"
              onClick={handleSearch}
            >
              Find a Doctor
            </button>
          </div>
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto px-6 -mt-16 z-10">
          <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <select
                      value={searchSpeciality}
                      onChange={(e) => setSearchSpeciality(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                      <option value="">Search by Speciality</option>
                      {specialities.map((speciality) => (
                          <option key={speciality} value={speciality}>
                              {speciality}
                          </option>
                      ))}
                  </select>
              </div>
              <span className="hidden md:inline-block text-gray-800 font-medium">OR</span>
              <div className="relative flex-1 w-full">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input
                      type="text"
                      placeholder="Search by Doctor's Name"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                  />
              </div>
              <button
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  onClick={handleSearch}
              >
                  <Search className="w-5 h-5" />
                  Search
              </button>
          </div>
      </div>


      <section ref={servicesRef} className="py-24 bg-gray-50" id="services">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Healthcare Services</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">Everything you need to manage your health in one place, from finding specialists to tracking your progress.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={<Stethoscope size={32}/>} 
                  title="Find a Doctor"
                  onClick={() => requireLogin("Find a Doctor", "/doctor-list")}
                >
                  Search our extensive network of certified specialists to find the perfect match for your needs.
                </FeatureCard>
                <FeatureCard 
                  icon={<Calendar size={32}/>} 
                  title="Book Appointments"
                  onClick={() => requireLogin("Book Appointments", "/doctor-list")}
                >
                  Schedule, manage, and get reminders for your appointments with just a few clicks.
                </FeatureCard>
                <FeatureCard 
                  icon={<HeartPulse size={32}/>} 
                  title="Health Tracker"
                  onClick={() => requireLogin("Health Tracker", "/health-tracker")}
                >
                  Monitor your health metrics, view your history, and share progress with your doctor securely.
                </FeatureCard>
            </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {statisticsLoading ? (
              <>
                <div className="text-center">
                  <div className="flex justify-center mb-2 animate-pulse">
                    <Hourglass className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    Completed Consultancy
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2 animate-pulse">
                    <Hourglass className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    Healthcare Professionals
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2 animate-pulse">
                    <Hourglass className="w-12 h-12 text-gray-300" />
                  </div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">
                    Service Takers
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <StatisticCard 
                    value={statistics.totalAppointments} 
                    label="Completed Consultancy" 
                  />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <StatisticCard 
                    value={statistics.totalDoctors} 
                    label="Healthcare Professionals" 
                  />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <StatisticCard 
                    value={statistics.totalPatients} 
                    label="Service Takers" 
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Get Appointment Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => requireLogin("Find a Doctor", "/doctor-list")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            <Calendar className="w-6 h-6" />
            Get Appointment Now
          </button>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get Started in 3 Simple Steps</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">A seamless experience from finding a doctor to getting the care you need.</p>
            </div>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between relative">
              <div className="hidden md:block absolute top-10 left-0 w-full h-1 border-t-2 border-dashed border-gray-300 -z-0" />
              <HowItWorksStep icon={<Search size={32} />} number="1" title="Find Your Doctor" description="Find your desired doctor based on name, specialty, and patient reviews." />
              <HowItWorksStep icon={<Calendar size={32} />} number="2" title="Make an Appointment" description="Easily book an available time slot that fits your schedule." />
              <HowItWorksStep icon={<ShieldCheck size={32} />} number="3" title="Get Quality Care" description="Connect with your doctor and get the best solution for your health." />
            </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Featured Doctors</h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">Meet our experienced healthcare professionals ready to provide you with the best care.</p>
          </div>
          
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
              {featuredDoctors.map((doctor) => (
                <div key={String(doctor._id)} className="flex-none w-80 snap-center">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="h-64 bg-gray-200 relative">
                      {doctor.profilePicture ? (
                        <img src={doctor.profilePicture} alt={`Dr. ${doctor.name}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <User className="w-24 h-24 text-blue-200" />
                  </div>
                      )}
                  </div>
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">Dr. {doctor.name}</h3>
                      <p className="text-blue-600 font-medium mb-4">{doctor.speciality}</p>
                      <p className="text-gray-600 text-sm mb-4">
                        {doctor.about || `A dedicated ${doctor.speciality.toLowerCase()} specialist.`}
                      </p>
                    <button 
                        onClick={() => requireLogin("Book Appointment", `/book-appointment/${doctor._id}`)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={reviewsRef} className="py-24 bg-blue-50/50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">We are proud to have helped so many people on their path to better health.</p>
                
                {/* Success Message */}
                {reviewSuccess && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-green-600 text-sm">{reviewSuccess}</p>
                  </div>
                )}
            </div>
            
            {/* Review Form and Video for Logged In Users */}
            {isLoggedIn && (
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-12 max-w-6xl mx-auto">
                {/* Review Form */}
                <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
                  <div className="aspect-square w-full">
                    <ReviewForm
                      reviewRating={reviewRating}
                      setReviewRating={setReviewRating}
                      reviewMessage={reviewMessage}
                      setReviewMessage={setReviewMessage}
                      reviewError={reviewError}
                      setReviewError={setReviewError}
                      reviewLoading={reviewLoading}
                      handleSubmitReview={handleSubmitReview}
                    />
                  </div>
                </div>
                
                {/* Thanks Image Section */}
                <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
                  <div className="aspect-square w-full">
                    <img 
                      src="/thanks.jpg"
                      alt="Thank you message"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <TestimonialCard 
                      key={index}
                      quote={review.reviewMessage}
                      name={review.patientName}
                      role="Patient"
                      rating={review.rating}
                    />
                  ))
                ) : (
                  // Fallback content if no reviews yet
                  <>
                <TestimonialCard 
                    quote="TreatWell made finding a specialist so easy. The appointment booking was seamless and the reminders were a lifesaver!"
                    name="Sarah L."
                    role="Patient"
                        rating={5}
                />
                <TestimonialCard 
                    quote="The Health Tracker is fantastic. I can finally see all my health data in one place, which has been incredibly helpful for managing my condition."
                    name="Michael B."
                    role="Patient"
                        rating={5}
                />
                <TestimonialCard 
                    quote="A truly professional and easy-to-use platform. It has completely changed how I manage my family's healthcare."
                    name="Emily R."
                    role="Patient"
                        rating={5}
                />
                  </>
                )}
            </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">TreatWell</h3>
              <p className="text-gray-400 max-w-sm">
                Your comprehensive healthcare platform, connecting patients with doctors and providing tools for better health management.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => requireLogin("Find a Doctor", "/doctor-list")} className="text-gray-400 hover:text-white transition">Find a Doctor</button></li>
                <li><button onClick={() => requireLogin("Appointments", "/appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => requireLogin("Medical History", "/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => requireLogin("Health Tracker", "/health-tracker")} className="text-gray-400 hover:text-white transition">Health Tracker</button></li>
                <li><button onClick={() => router.push("/login")} className="text-gray-400 hover:text-white transition">Login</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><p>Ruponti Muin Nova</p></li>
                <li><p>Jawad Anzum Fahim</p></li>
                <li className="pt-2"><a href="mailto:ruponti@gmail.com" className="hover:text-white transition">ruponti@gmail.com</a></li>
              </ul>
            </div>
             <div>
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>
               <p className="text-gray-400 mb-2 text-sm">We value your feedback!</p>
              <button 
                onClick={scrollToReviews}
                className="text-blue-400 hover:text-blue-300 transition font-semibold"
              >
                Send Feedback
              </button>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} TreatWell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}