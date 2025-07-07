"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, Calendar, HeartPulse, User, Star, ShieldCheck, Briefcase, UserCheck, LogOut, Send } from 'lucide-react';
import { Notification } from '@/components/Notification';
import { IReviewDoctor } from "@/models/ReviewDoctor";

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
          placeholder="Share your experience with TreatWell as a healthcare provider..."
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

const LoginModal = ({ feature, onClose, onConfirm }: { feature: string, onClose: () => void, onConfirm: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-95 hover:scale-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please log in to access this feature.</p>
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
};

export default function DoctorHome() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [modalInfo, setModalInfo] = useState<{ feature: string; visible: boolean } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState({ message: "", isVisible: false });
  const [reviews, setReviews] = useState<IReviewDoctor[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd check for a doctor-specific token.
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const welcomeMessage = localStorage.getItem('welcomeMessage');
    if (welcomeMessage) {
      setNotification({ message: welcomeMessage, isVisible: true });
      localStorage.removeItem('welcomeMessage');
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews-doctor');
        if (res.ok) {
          const data = await res.json();
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch doctor reviews", error);
      }
    };

    fetchReviews();
  }, []);

  const requireLogin = (feature: string, path?: string) => {
    if (isLoggedIn) {
        if (path) router.push(path);
    } else {
        setModalInfo({ feature, visible: true });
    }
  };
  
  const handleModalConfirm = () => {
    setModalInfo(null);
    router.push("/doctor/login"); // Redirect to a doctor-specific login page
  };

  const handleModalClose = () => {
    setModalInfo(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('welcomeMessage'); // Also clear the welcome message
    setIsLoggedIn(false);
    setNotification({ message: "You have been logged out.", isVisible: true });
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, isVisible: false });
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
      const res = await fetch('/api/reviews-doctor', {
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
        const reviewsRes = await fetch('/api/reviews-doctor');
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

  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">{children}</p>
    </div>
  );
  
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
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
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
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Appointments", "/doctor/appointments")}>
            Appointments
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Medical History", "/doctor/medical-history")}>
            Medical History
          </button>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/doctor/profile")}
              >
                Profile
              </button>
              <button
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="hidden md:inline-block text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50"
                onClick={() => router.push("/")}
              >
                Are you a patient?
              </button>
              <button
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                onClick={() => router.push("/doctor/login")}
              >
                Doctor Login
              </button>
            </>
          )}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center flex-1 py-20 md:py-28 relative text-center">
        <div className="absolute inset-0 bg-[url('/doctor-homepage.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-gray-900/80"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Join Our Network of Professionals<br/>
            <span className="text-lime-300">Welcome to TreatWell.</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Empower your practice, connect with patients, and streamline your workflow with our dedicated platform for healthcare providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
              onClick={scrollToServices}
            >
              See Our Services
            </button>
            <button
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 border border-gray-200"
              onClick={() => requireLogin("Appointments", "/doctor/appointments")}
            >
              Check Appointments
            </button>
          </div>
        </div>
      </section>

      <section ref={servicesRef} className="py-24 bg-gray-50" id="services">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tools for the Modern Practitioner</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">Everything you need to manage your practice and provide exceptional care, all in one place.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard icon={<Briefcase size={32}/>} title="Manage Your Profile">
                  Showcase your expertise, experience, and qualifications to attract the right patients.
                </FeatureCard>
                <FeatureCard icon={<Calendar size={32}/>} title="Appointment Scheduling">
                  Effortlessly manage your calendar, set availability, and reduce no-shows with automated reminders.
                </FeatureCard>
                <FeatureCard icon={<UserCheck size={32}/>} title="Connect With Patients">
                  Securely communicate with your patients, view their history, and provide continuous care.
                </FeatureCard>
            </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get Started in 3 Simple Steps</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">A seamless experience from joining our platform to consulting with patients.</p>
            </div>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between relative">
              <div className="hidden md:block absolute top-10 left-0 w-full h-1 border-t-2 border-dashed border-gray-300 -z-0" />
              <HowItWorksStep icon={<User size={32} />} number="1" title="Create Your Profile" description="Register and build your professional profile to get discovered by patients." />
              <HowItWorksStep icon={<Calendar size={32} />} number="2" title="Set Availability" description="Define your schedule and services to let patients book appointments easily." />
              <HowItWorksStep icon={<ShieldCheck size={32} />} number="3" title="Provide Care" description="Connect with patients and provide them with top-quality healthcare services." />
            </div>
        </div>
      </section>

      <section ref={reviewsRef} className="py-24 bg-blue-50/50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Doctors Say</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">We are proud to have helped so many healthcare professionals enhance their practice.</p>
                
                {/* Success Message */}
                {reviewSuccess && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-green-600 text-sm">{reviewSuccess}</p>
                  </div>
                )}
            </div>
            
            {/* Review Form and Thanks Image for Logged In Doctors */}
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
                      name={review.doctorName}
                      role="Doctor"
                      rating={review.rating}
                    />
                  ))
                ) : (
                  // Fallback content if no reviews yet
                  <>
                <TestimonialCard 
                    quote="TreatWell has been a game-changer for my private practice. I can manage appointments and patient records so efficiently."
                    name="Dr. Evelyn Reed"
                    role="Cardiologist"
                    rating={5}
                />
                <TestimonialCard 
                    quote="The platform is intuitive and has significantly reduced my administrative workload, allowing me to focus more on patient care."
                    name="Dr. Marcus Thorne"
                    role="Neurologist"
                    rating={5}
                />
                <TestimonialCard 
                    quote="A fantastic tool for reaching new patients and managing my schedule. I highly recommend it to my colleagues."
                    name="Dr. Elena Vasquez"
                    role="Dermatologist"
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
              <h3 className="text-2xl font-bold text-white mb-4">TreatWell for Doctors</h3>
              <p className="text-gray-400 max-w-sm">
                The all-in-one platform to enhance your practice, connect with patients, and deliver outstanding care.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => requireLogin("Appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => requireLogin("Medical History", "/doctor/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => requireLogin("Profile", "/doctor/profile")} className="text-gray-400 hover:text-white transition">Profile</button></li>
                <li><button onClick={() => router.push("/doctor/login")} className="text-gray-400 hover:text-white transition">Login</button></li>
                <li><button onClick={() => router.push("/doctor/register")} className="text-gray-400 hover:text-white transition">Register</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><p>Ruponti Muin Nova</p></li>
                <li><p>Jawad Anzum Fahim</p></li>
                <li className="pt-2"><a href="mailto:support@treatwell.com" className="hover:text-white transition">support@treatwell.com</a></li>
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