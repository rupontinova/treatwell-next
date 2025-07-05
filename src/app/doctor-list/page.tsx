'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IDoctor } from '@/models/Doctor';
import { Stethoscope, User, Search, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';

// Removed hard-coded specialities - now loaded dynamically

function DoctorListComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [searchName, setSearchName] = useState(searchParams.get('name') || '');
  const [searchSpeciality, setSearchSpeciality] = useState(searchParams.get('speciality') || '');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'sl', direction: 'asc' });

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch doctors');
        }
        setDoctors(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
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

    fetchDoctors();
    fetchSpecialities();
  }, []);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch = doctor.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const specialityMatch =
      !searchSpeciality || doctor.speciality.toLowerCase() === searchSpeciality.toLowerCase();
    return nameMatch && specialityMatch;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'speciality') {
      return sortConfig.direction === 'asc'
        ? a.speciality.localeCompare(b.speciality)
        : b.speciality.localeCompare(a.speciality);
    }
    return 0;
  });
  
  if (sortConfig.key === 'sl' && sortConfig.direction === 'desc') {
      sortedDoctors.reverse();
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div
          className="text-3xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          TreatWell
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-gray-100"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Find Your Perfect Doctor</h1>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">Search our extensive network of specialists to find the right one for you.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-10 sticky top-[88px] z-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <Search className="absolute left-3 top-10 w-5 h-5 text-gray-400"/>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                placeholder="e.g., Dr. John Doe"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Speciality
              </label>
              <Stethoscope className="absolute left-3 top-10 w-5 h-5 text-gray-400"/>
              <select
                value={searchSpeciality}
                onChange={(e) => setSearchSpeciality(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
              >
                <option value="">All Specialities</option>
                {specialities.map((speciality) => (
                  <option key={speciality} value={speciality}>
                    {speciality}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
                >
                  <option value="sl">Default</option>
                  <option value="name">Name</option>
                  <option value="speciality">Speciality</option>
                </select>
                <button
                  onClick={() => handleSort(sortConfig.key)}
                  className="p-2 border rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Toggle sort direction"
                >
                  {sortConfig.direction === 'asc' ? <ArrowUp className="w-5 h-5 text-gray-600" /> : <ArrowDown className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && <p className="text-center py-10 text-lg font-medium text-gray-600">Loading doctors...</p>}
        {error && <p className="text-center py-10 text-lg font-medium text-red-500">Error: {error}</p>}
        
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedDoctors.map((doctor) => (
                <div key={String(doctor._id)} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden flex flex-col border border-gray-100">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {doctor.profilePicture ? (
                          <img src={doctor.profilePicture} alt={`Dr. ${doctor.name}`} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{doctor.name}</h2>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          <p className="text-sm font-medium">{doctor.speciality}</p>
                        </div>
                      </div>
                    </div>
                    {/* Placeholder for more info */}
                    <p className="text-gray-600 text-sm">
                      Dr. {doctor.name.split(' ').slice(1).join(' ')} is a dedicated {doctor.speciality.toLowerCase()} specialist. 
                      {doctor.isRegistered ? " Now accepting new patients." : " Currently unavailable for booking."}
                    </p>
                  </div>
                  <div className="p-5 bg-gray-50/70">
                          <button
                            onClick={() => router.push(`/book-appointment/${doctor._id}`)}
                      disabled={!doctor.isRegistered}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                          >
                      {doctor.isRegistered ? 'Book Appointment' : 'Unavailable'}
                          </button>
                  </div>
                </div>
                  ))}
            </div>
            {sortedDoctors.length === 0 && (
              <div className="text-center py-16 col-span-full">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Doctors Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
            )}
          </>
        )}
      </main>

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
                <li><button onClick={() => router.push("/doctor-list")} className="text-gray-400 hover:text-white transition">Find a Doctor</button></li>
                <li><button onClick={() => router.push("/appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => router.push("/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => router.push("/health-tracker")} className="text-gray-400 hover:text-white transition">Health Tracker</button></li>
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
                onClick={() => router.push("/")}
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

export default function DoctorList() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorListComponent />
    </Suspense>
  );
} 