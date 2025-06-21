"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, Calendar, HeartPulse, User, Star, ShieldCheck } from 'lucide-react';
import { Notification } from '@/components/Notification';
import { IDoctor } from "@/models/Doctor";

const LoginModal = ({ feature, onClose, onConfirm }: { feature: string, onClose: () => void, onConfirm: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

const specialities = [
    'Cardiology',
    'Neurology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
];

export default function Home() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [modalInfo, setModalInfo] = useState<{ feature: string; visible: boolean } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchSpeciality, setSearchSpeciality] = useState("");
  const [featuredDoctors, setFeaturedDoctors] = useState<IDoctor[]>([]);
  const router = useRouter();

  useEffect(() => {
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
          const timer = setTimeout(() => {
            setShowWelcome(false);
          }, 5000);
          return () => clearTimeout(timer);
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

    fetchFeaturedDoctors();
  }, []);

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

  const TestimonialCard = ({ quote, name, role }: { quote: string, name: string, role: string }) => (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-yellow-400 flex justify-center mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
        </div>
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
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => requireLogin("Health Tracker", "/health-tracker")}>
            Health Tracker
          </button>
        </div>
        <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-all duration-300"
                    onClick={() => router.push("/profile")}
                >
                    Profile
                </button>
                <button
                    className="px-5 py-2.5 bg-red-400 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      router.push('/');
                    }}
                >
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
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Your Health, Our Priority.<br/>
            <span className="text-lime-300">TreatWell.</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl">
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
              <span className="hidden md:inline-block text-gray-300 font-medium">OR</span>
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
                <FeatureCard icon={<Stethoscope size={32}/>} title="Find a Doctor">
                  Search our extensive network of certified specialists to find the perfect match for your needs.
                </FeatureCard>
                <FeatureCard icon={<Calendar size={32}/>} title="Book Appointments">
                  Schedule, manage, and get reminders for your appointments with just a few clicks.
                </FeatureCard>
                <FeatureCard icon={<HeartPulse size={32}/>} title="Health Tracker">
                  Monitor your health metrics, view your history, and share progress with your doctor securely.
                </FeatureCard>
            </div>
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
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{doctor.name}</h3>
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

      <section className="py-24 bg-blue-50/50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto">We are proud to have helped so many people on their path to better health.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <TestimonialCard 
                    quote="TreatWell made finding a specialist so easy. The appointment booking was seamless and the reminders were a lifesaver!"
                    name="Sarah L."
                    role="Patient"
                />
                <TestimonialCard 
                    quote="The Health Tracker is fantastic. I can finally see all my health data in one place, which has been incredibly helpful for managing my condition."
                    name="Michael B."
                    role="Patient"
                />
                <TestimonialCard 
                    quote="A truly professional and easy-to-use platform. It has completely changed how I manage my family's healthcare."
                    name="Emily R."
                    role="Patient"
                />
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
                onClick={() => requireLogin("Feedback", "/feedback")}
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