'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAppointment } from '@/models/Appointment';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view appointments.');
        setLoading(false);
        return;
      }
      
      const patient = JSON.parse(userData);
      const patientId = patient?.id || patient?._id;

      if (!patientId) {
        setError('Could not find your patient ID.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/appointments?patientId=${patientId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch appointments');
        }
        setAppointments(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to cancel appointment');
            }

            setAppointments(appointments.filter(apt => apt._id.toString() !== id));
            setSuccessMessage('Your appointment has been canceled!');
            
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          href="/"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Back to Home
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Appointments</h1>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            ✅ {successMessage}
          </div>
        )}

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speciality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                    <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.appointmentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.appointmentTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                        <div className="text-sm text-gray-500">{appointment.designation}</div>
                        <div className="text-xs text-gray-500">{appointment.qualification}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.speciality}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                        <div className="text-sm text-gray-500">{appointment.appointmentDay}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.status.toLowerCase() === 'pending' && (
                            <button
                            onClick={() => handleCancel(appointment._id.toString())}
                            className="text-red-600 hover:text-red-900 font-medium"
                            >
                            Cancel
                            </button>
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        )}
      </div>
    </div>
  );
} 