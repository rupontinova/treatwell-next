'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IDoctor } from '@/models/Doctor';
import { IPatient } from '@/models/Patient';

const availableTimeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const availableDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

export default function BookAppointment({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctor, setFetchingDoctor] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await fetch(`/api/doctors/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch doctor details');
        }
        setDoctor(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch doctor details");
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
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTime || !selectedDay) {
      setError('Please select a time and day!');
      return;
    }

    if (!doctor || !patient) {
      setError('Doctor or patient information is missing.');
      return;
    }

    setLoading(true);
    
    const appointmentData = {
      patientId: patient._id,
      patientName: patient.fullName,
      doctorId: doctor._id,
      doctorName: doctor.name,
      speciality: doctor.speciality,
      doctorInfo: doctor.about,
      location: doctor.location,
      designation: doctor.designation,
      qualification: doctor.qualification,
      appointmentDate: new Date().toLocaleDateString(),
      appointmentDay: selectedDay,
      appointmentTime: selectedTime,
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

      setSuccess('Appointment successfully booked!');
      setTimeout(() => {
        router.push('/appointments');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDoctor) {
      return <div className="text-center py-10">Loading doctor details...</div>
  }

  if (error && !doctor) {
      return <div className="text-center py-10 text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md sticky top-0 z-10">
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          TreatWell
        </div>
        <Link
          href="/doctor-list"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Back to Doctor List
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Book Appointment</h1>

        {doctor && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Doctor Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <p className="text-gray-600"><span className="font-medium">Name:</span> {doctor.name}</p>
                <p className="text-gray-600"><span className="font-medium">Speciality:</span> {doctor.speciality}</p>
                <p className="text-gray-600"><span className="font-medium">Location:</span> {doctor.location}</p>
                <p className="text-gray-600"><span className="font-medium">Designation:</span> {doctor.designation}</p>
                </div>
                <div>
                <p className="text-gray-600"><span className="font-medium">Qualification:</span> {doctor.qualification}</p>
                <p className="text-gray-600"><span className="font-medium">Phone:</span> 
                    <a href={`tel:${doctor.phone}`} className="text-blue-600 hover:underline ml-1">
                    {doctor.phone}
                    </a>
                </p>
                <p className="text-gray-600"><span className="font-medium">About:</span> {doctor.about}</p>
                </div>
            </div>
            </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book Your Appointment</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              ❌ {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
                  required
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
                  required
                >
                  <option value="">Select a day</option>
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 