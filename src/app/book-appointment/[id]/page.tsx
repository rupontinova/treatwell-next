'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IDoctor } from '@/models/Doctor';
import { IPatient } from '@/models/Patient';
import { User, Stethoscope, MapPin, Briefcase, GraduationCap, Phone, Info, Calendar, Clock } from 'lucide-react';

const availableTimeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

// Generate next 7 days (excluding weekends for medical appointments)
const getNextWeekDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (futureDate.getDay() !== 0 && futureDate.getDay() !== 6) {
      const dayName = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = futureDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      const fullDate = futureDate.toLocaleDateString();
      
      days.push({
        dayName,
        dateString,
        fullDate,
        date: futureDate
      });
    }
  }
  return days;
};

export default function BookAppointment({ params }: { params: { id:string } }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctor, setFetchingDoctor] = useState(true);
  const [availableDays, setAvailableDays] = useState<Array<{dayName: string, dateString: string, fullDate: string, date: Date}>>([]);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await fetch(`/api/doctors/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch doctor details');
        }
        setDoctor(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingDoctor(false);
      }
    };

    if (params.id) {
      fetchDoctorDetails();
    }
  }, [params.id]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setPatient(JSON.parse(userData));
    } else {
        router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    // Initialize available days for the next week
    setAvailableDays(getNextWeekDays());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTime || !selectedDay || !selectedDate) {
      setError('Please select a day and a time slot!');
      return;
    }

    if (!doctor || !patient) {
      setError('Doctor or patient information is missing.');
      return;
    }

    setLoading(true);
    
    // @ts-ignore
    const patientId = patient.id || patient._id;
    if (!patientId) {
        setError('Could not identify patient. Please log in again.');
        setLoading(false);
        return;
    }

    const appointmentData = {
      patientId: patientId,
      patientName: patient.fullName,
      doctorId: doctor._id,
      doctorName: doctor.name,
      speciality: doctor.speciality,
      doctorInfo: doctor.about,
      location: doctor.location,
      designation: doctor.designation,
      qualification: doctor.qualification,
      appointmentDate: selectedDate,
      appointmentDay: selectedDay,
      appointmentTime: selectedTime,
      // Payment fields for new appointments
      paymentStatus: 'unpaid',
      paymentAmount: 0,
      // paymentDate will be set when payment is made
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      setSuccess('Appointment successfully booked! Redirecting to your appointments...');
      setTimeout(() => {
        router.push('/appointments');
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start text-sm text-gray-600 mb-3">
        <div className="text-gray-400 w-5 h-5 mr-3 mt-0.5">{icon}</div>
        <div>
            <span className="font-semibold text-gray-800">{label}:</span> {value}
        </div>
    </div>
  );

  if (fetchingDoctor) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-lg font-medium text-gray-600">Loading doctor details...</p>
        </div>
      );
  }

  if (error && !doctor) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-center py-10 text-lg font-medium text-red-500">Error: {error}</p>
        </div>
      )
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
        <Link
          href="/doctor-list"
          className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          Back to Doctor List
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Book Your Appointment</h1>
            <p className="text-lg text-gray-500">Secure your time slot with {doctor?.name}</p>
            <p className="text-sm text-blue-600 font-medium mt-2">📅 Available for booking: Next 7 days only (weekdays)</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Doctor Info Column */}
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor Details</h2>
                    {doctor && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                                {doctor.profilePicture ? (
                                    <img src={doctor.profilePicture} alt={`Dr. ${doctor.name}`} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-blue-500" />
                                )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                                    <p className="text-md text-blue-600 font-medium">{doctor.speciality}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <DetailItem icon={<Briefcase size={18}/>} label="Designation" value={doctor.designation} />
                                <DetailItem icon={<GraduationCap size={18}/>} label="Qualification" value={doctor.qualification} />
                                <DetailItem icon={<MapPin size={18}/>} label="Location" value={doctor.location} />
                                <DetailItem icon={<Phone size={18}/>} label="Phone" value={
                                    <a href={`tel:${doctor.phone}`} className="text-blue-600 hover:underline">{doctor.phone}</a>
                                } />
                                <DetailItem icon={<Info size={18}/>} label="About" value={doctor.about} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Form Column */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Time and Day</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                1. Select a Day
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {availableDays.map((day) => (
                                    <button
                                        type="button"
                                        key={day.fullDate}
                                        onClick={() => {
                                            setSelectedDay(day.dayName);
                                            setSelectedDate(day.fullDate);
                                        }}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left ${selectedDay === day.dayName ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200'}`}
                                    >
                                        <div className="font-semibold">{day.dayName}</div>
                                        <div className="text-xs opacity-75">{day.dateString}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                                2. Select a Time Slot
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {availableTimeSlots.map((time) => (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">❌ {error}</div>}
                        {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium text-center">✅ {success}</div>}
                        
                        <div className="border-t border-gray-200 pt-6 text-center">
                            <button
                                type="submit"
                                className="w-full md:w-auto px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={loading || !selectedDay || !selectedTime || !selectedDate}
                            >
                                {loading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
} 