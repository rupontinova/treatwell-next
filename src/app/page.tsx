"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const servicesRef = useRef<HTMLDivElement>(null);//hello comment branch 
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

 
  const requireLogin = (feature: string) => {
    alert(`Please log in to access ${feature}.`);
    router.push("/login");
  };


  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md sticky top-0 z-10">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          TreatWell
        </div>
        {/* Menu */}
        <div className="flex items-center space-x-6">
          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => requireLogin("Find a Doctor")}
          >
            Find a Doctor
          </button>
          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => requireLogin("Appointments")}
          >
            Appointments
          </button>
          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => requireLogin("Health Tracker")}
          >
            Health Tracker
          </button>
          <button
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-16 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
          Welcome to TreatWell
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
          Your health, our priority. Find doctors, track your health, and manage appointments—all in one place.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mb-8"
          onClick={scrollToServices}
        >
          See Services
        </button>

        {/* Search Section */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by Speciality (e.g., Cardiology)"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
            onKeyDown={e => {
              if (e.key === "Enter") requireLogin("Doctor List");
            }}
          />
          <span className="text-gray-400 font-medium">or</span>
          <input
            type="text"
            placeholder="Search by Doctor's Name"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
            onKeyDown={e => {
              if (e.key === "Enter") requireLogin("Doctor List");
            }}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => requireLogin("Doctor List")}
          >
            Search
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-16 bg-white" id="services">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Our Services</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Book Doctor */}
          <div className="bg-blue-50 p-6 rounded-lg shadow flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Book a Doctor</h3>
            <p className="text-gray-600 mb-4 text-center">
              Find the right doctor for you and book appointments easily.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => requireLogin("Book a Doctor")}
            >
              Book Doctor
            </button>
          </div>
          {/* Health Tracker */}
          <div className="bg-green-50 p-6 rounded-lg shadow flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-2  text-gray-800">Health Tracker</h3>
            <p className="text-gray-600 mb-4 text-center">
              Track your health metrics and stay on top of your wellness journey.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={() => requireLogin("Health Tracker")}
            >
              Go to Health Tracker
            </button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">How it works</h2>
        <p className="text-center text-gray-500 mb-12">Guidelines for using TreatWell</p>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between relative">
          {/* Dashed line */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-300 z-0" style={{zIndex:0}} />
          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center z-10 mb-12 md:mb-0">
            {/* Icon */}
            <svg viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000" className="w-[72px] h-[72px] rounded-lg p-2"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#444" d="M14 11.3c-1-1.9-2-1.6-3.1-1.7 0.1 0.3 0.1 0.6 0.1 1 1.6 0.4 2 2.3 2 3.4v1h-2v-1h1c0 0 0-2.5-1.5-2.5s-1.5 2.4-1.5 2.5h1v1h-2v-1c0-1.1 0.4-3.1 2-3.4 0-0.6-0.1-1.1-0.2-1.3-0.2-0.1-0.4-0.3-0.4-0.6 0-0.6 0.8-0.4 1.4-1.5 0 0 0.9-2.3 0.6-4.3h-1c0-0.2 0.1-0.3 0.1-0.5s0-0.3-0.1-0.5h0.8c-0.3-1-1.3-1.9-3.2-1.9 0 0 0 0 0 0s0 0 0 0 0 0 0 0c-1.9 0-2.9 0.9-3.3 2h0.8c0 0.2-0.1 0.3-0.1 0.5s0 0.3 0.1 0.5h-1c-0.2 2 0.6 4.3 0.6 4.3 0.6 1 1.4 0.8 1.4 1.5 0 0.5-0.5 0.7-1.1 0.8-0.2 0.2-0.4 0.6-0.4 1.4 0 0.4 0 0.8 0 1.2 0.6 0.2 1 0.8 1 1.4 0 0.7-0.7 1.4-1.5 1.4s-1.5-0.7-1.5-1.5c0-0.7 0.4-1.2 1-1.4 0-0.3 0-0.7 0-1.2s0.1-0.9 0.2-1.3c-0.7 0.1-1.5 0.4-2.2 1.7-0.6 1.1-0.9 4.7-0.9 4.7h13.7c0.1 0-0.2-3.6-0.8-4.7zM6.5 2.5c0-0.8 0.7-1.5 1.5-1.5s1.5 0.7 1.5 1.5-0.7 1.5-1.5 1.5-1.5-0.7-1.5-1.5z"></path> <path fill="#444" d="M5 13.5c0 0.276-0.224 0.5-0.5 0.5s-0.5-0.224-0.5-0.5c0-0.276 0.224-0.5 0.5-0.5s0.5 0.224 0.5 0.5z"></path> </g></svg>
            {/* Number */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600 mb-4 border-2 border-gray-200">1</div>
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Find Your Doctor</h3>
            {/* Description */}
            <p className="text-gray-500 text-center max-w-xs">Find your desired doctor based on name and specialty</p>
          </div>
          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center z-10 mb-12 md:mb-0">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-[72px] h-[72px] rounded-lg p-2"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m 6.5 0 c -3.578125 0 -6.5 2.921875 -6.5 6.5 s 2.921875 6.5 6.5 6.5 c 0.167969 0 0.335938 -0.007812 0.5 -0.019531 v -2.007813 c -0.164062 0.019532 -0.332031 0.027344 -0.5 0.027344 c -2.496094 0 -4.5 -2.003906 -4.5 -4.5 s 2.003906 -4.5 4.5 -4.5 s 4.5 2.003906 4.5 4.5 c 0 0.167969 -0.007812 0.335938 -0.027344 0.5 h 2.007813 c 0.011719 -0.164062 0.019531 -0.332031 0.019531 -0.5 c 0 -3.578125 -2.921875 -6.5 -6.5 -6.5 z m 0 3 c -0.277344 0 -0.5 0.222656 -0.5 0.5 v 2.5 h -1.5 c -0.277344 0 -0.5 0.222656 -0.5 0.5 s 0.222656 0.5 0.5 0.5 h 2 c 0.277344 0 0.5 -0.222656 0.5 -0.5 v -3 c 0 -0.277344 -0.222656 -0.5 -0.5 -0.5 z m 4.5 5 v 3 h -3 v 2 h 3 v 3 h 2 v -3 h 3 v -2 h -3 v -3 z m 0 0" fill="#2e3436"></path> </g></svg>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600 mb-4 border-2 border-gray-200">2</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Make an Appointment</h3>
            <p className="text-gray-500 text-center max-w-xs">Easily book your appointment on the desired date</p>
          </div>
          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center z-10">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[72px] h-[72px] rounded-lg p-2"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.5 9.00002H16.5M16.5 9.00002L14.5 9.00002M16.5 9.00002L16.5 7M16.5 9.00002L16.5 11" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M8.96173 19.3786L9.43432 18.7963L8.96173 19.3786ZM12 5.57412L11.4522 6.08635C11.594 6.23803 11.7923 6.32412 12 6.32412C12.2077 6.32412 12.406 6.23803 12.5478 6.08635L12 5.57412ZM15.0383 19.3787L15.5109 19.961L15.0383 19.3787ZM12 21L12 20.25L12 21ZM2.65159 13.6821C2.86595 14.0366 3.32705 14.1501 3.68148 13.9358C4.03591 13.7214 4.14946 13.2603 3.9351 12.9059L2.65159 13.6821ZM6.53733 16.1707C6.24836 15.8739 5.77352 15.8676 5.47676 16.1566C5.18 16.4455 5.17369 16.9204 5.46267 17.2171L6.53733 16.1707ZM2.75 9.3175C2.75 6.41289 4.01766 4.61731 5.58602 4.00319C7.15092 3.39043 9.34039 3.82778 11.4522 6.08635L12.5478 5.06189C10.1598 2.50784 7.34924 1.70187 5.0391 2.60645C2.73242 3.50967 1.25 5.99209 1.25 9.3175H2.75ZM15.5109 19.961C17.0033 18.7499 18.7914 17.1268 20.2127 15.314C21.6196 13.5196 22.75 11.4354 22.75 9.31747H21.25C21.25 10.9289 20.3707 12.6814 19.0323 14.3884C17.7084 16.077 16.0156 17.6197 14.5657 18.7963L15.5109 19.961ZM22.75 9.31747C22.75 5.99208 21.2676 3.50966 18.9609 2.60645C16.6508 1.70187 13.8402 2.50784 11.4522 5.06189L12.5478 6.08635C14.6596 3.82778 16.8491 3.39042 18.414 4.00319C19.9823 4.6173 21.25 6.41287 21.25 9.31747H22.75ZM8.48914 19.961C9.76058 20.9928 10.6423 21.75 12 21.75L12 20.25C11.2771 20.25 10.8269 19.9263 9.43432 18.7963L8.48914 19.961ZM14.5657 18.7963C13.1731 19.9263 12.7229 20.25 12 20.25L12 21.75C13.3577 21.75 14.2394 20.9928 15.5109 19.961L14.5657 18.7963ZM3.9351 12.9059C3.18811 11.6708 2.75 10.455 2.75 9.3175H1.25C1.25 10.8297 1.82646 12.3179 2.65159 13.6821L3.9351 12.9059ZM9.43432 18.7963C8.51731 18.0521 7.49893 17.1582 6.53733 16.1707L5.46267 17.2171C6.47548 18.2572 7.53996 19.1908 8.48914 19.961L9.43432 18.7963Z" fill="#1C274C"></path> </g></svg>
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-600 mb-4 border-2 border-gray-200">3</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Get Services</h3>
            <p className="text-gray-500 text-center max-w-xs">We will help to find and provide solutions for your health</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => requireLogin("Find a Doctor")} className="hover:text-blue-400 transition">Find a Doctor</button></li>
                <li><button onClick={() => requireLogin("Appointments")} className="hover:text-blue-400 transition">Appointments</button></li>
                <li><button onClick={() => requireLogin("Health Tracker")} className="hover:text-blue-400 transition">Health Tracker</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-blue-400 transition">Login</button></li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-300">
                TreatWell is your comprehensive healthcare platform, connecting patients with doctors and providing tools for better health management.
              </p>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>
              <p className="text-gray-300 mb-2">We value your feedback!</p>
              <button 
                onClick={() => requireLogin("Feedback")}
                className="text-blue-400 hover:text-blue-300 transition"
              >
                Send us your feedback
              </button>
            </div>

            {/* Developers */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Developers</h3>
              <div className="space-y-2">
                <p className="text-gray-300">Team Members:</p>
                <ul className="text-gray-300 space-y-1">
                  <li>Ruponti Muin Nova</li>
                  <li>Jawad Anzum Fahim</li> </ul>
                <p className="text-gray-300 mt-4">Contact: <a href="mailto:ruponti@gmail.com" className="text-blue-400 hover:text-blue-300 transition">ruponti@gmail.com</a></p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TreatWell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

    