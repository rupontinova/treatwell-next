'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAppointment } from '@/models/Appointment';
import { Calendar, Clock, User, MapPin, Stethoscope, Hash, AlertTriangle, CheckCircle, XCircle, Briefcase, GraduationCap, Info, ChevronDown, Video, Mail, ArrowLeft } from 'lucide-react';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [patientName, setPatientName] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view appointments.');
        setLoading(false);
        router.push('/login');
        return;
      }
      
      const patient = JSON.parse(userData);
      const patientId = patient?.id || patient?._id;
      setPatientName(patient.fullName || '');

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
        // Sort appointments by creation date (newest first) using ObjectId timestamp
        const sortedAppointments = data.data.sort((a: any, b: any) => {
          const timeA = parseInt(a._id.toString().substring(0, 8), 16);
          const timeB = parseInt(b._id.toString().substring(0, 8), 16);
          return timeB - timeA;
        });
        setAppointments(sortedAppointments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [router]);

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
            setSuccessMessage('Your appointment has been successfully canceled!');
            
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        }
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      pending: {
        icon: <AlertTriangle className="w-4 h-4 mr-2" />,
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      done: {
        icon: <CheckCircle className="w-4 h-4 mr-2" />,
        text: 'Confirmed',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      declined: {
        icon: <XCircle className="w-4 h-4 mr-2" />,
        text: 'Declined',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
    };
    
    const currentStatus = statusMap[status.toLowerCase() as keyof typeof statusMap] || {
        icon: <AlertTriangle className="w-4 h-4 mr-2" />,
        text: 'Unknown',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <div className={`px-3 py-1.5 inline-flex items-center text-sm font-semibold rounded-full border ${currentStatus.className}`}>
        {currentStatus.icon}
        {currentStatus.text}
      </div>
    );
  };

  const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start text-sm py-2">
        <div className="w-6 h-6 mr-3 text-gray-400">{icon}</div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-gray-600">{value}</p>
        </div>
    </div>
  );

  // Helper function to format date and day display
  const formatDateDisplay = (appointmentDate: string, appointmentDay: string) => {
    try {
      // Check if appointmentDate is valid
      if (!appointmentDate || appointmentDate === 'undefined' || appointmentDate === 'null') {
        return {
          primaryDate: 'No Date',
          dayName: appointmentDay || 'Unknown Day'
        };
      }

      // Parse DD/MM/YYYY format (which is what we have in database)
      let date: Date;
      const parts = appointmentDate.split('/');
      
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Create date with DD/MM/YYYY format
        date = new Date(year, month - 1, day); // month is 0-indexed in JS
      } else {
        // Fallback: try direct parsing
        date = new Date(appointmentDate);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return {
          primaryDate: appointmentDate, // Just show the raw date
          dayName: appointmentDay || 'Unknown Day'
        };
      }

      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        primaryDate: formattedDate,
        dayName: appointmentDay
      };
    } catch (error) {
      return {
        primaryDate: appointmentDate || 'Unknown Date',
        dayName: appointmentDay || 'Unknown Day'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div
          className="text-3xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          TreatWell
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/appointments")}>
            Appointments
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/medical-history")}>
            Medical History
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/health-tracker")}>
            Health Tracker
          </button>
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
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Your Appointments</h1>
            {patientName && <p className="text-lg text-gray-500">Hello, {patientName}! Here is a list of your scheduled appointments.</p>}
            <div className="mt-4">
              <button
                onClick={() => router.push('/payment-history')}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View Payment History
              </button>
            </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium text-center">
            ✅ {successMessage}
          </div>
        )}

        {loading && <p className="text-center py-10 text-lg font-medium text-gray-600">Loading your appointments...</p>}
        {error && <p className="text-center py-10 text-lg font-medium text-red-500">Error: {error}</p>}

                {!loading && !error && (
            <>
            {appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map((appointment) => (
                    <div key={appointment.appointmentId} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden">
                        <div className="p-5 md:p-6 cursor-pointer" onClick={() => setExpandedCard(expandedCard === appointment.appointmentId ? null : appointment.appointmentId)}>
                           <div className="flex flex-col md:flex-row justify-between items-center">
                                {/* Left: Doctor Info */}
                                <div className="flex-1 mb-4 md:mb-0">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{appointment.doctorName}</h2>
                                    <p className="text-md text-blue-600 font-medium flex items-center mt-1"><Stethoscope className="w-4 h-4 mr-2" />{appointment.speciality}</p>
                                </div>
                                
                                {/* Center: Date & Time - Prominent Display */}
                                <div className="flex-1 text-center bg-blue-50 rounded-lg p-4 mx-0 md:mx-6 mb-4 md:mb-0 border border-blue-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Date & Day</p>
                                            <div className="font-bold text-gray-800 mt-1">
                                                <p className="text-lg leading-tight">{formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).dayName}</p>
                                                <p className="text-sm text-gray-600">{formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).primaryDate}</p>
                                            </div>
                                        </div>
                                        <div className="text-center border-l border-blue-200 pl-4">
                                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Time</p>
                                            <p className="font-bold text-gray-800 text-lg mt-1">{appointment.appointmentTime}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right: Status & Controls */}
                                <div className="flex-1 flex items-center justify-end gap-4">
                                    <div className="hidden md:block">
                                        <StatusBadge status={appointment.status} />
                                    </div>
                                    <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${expandedCard === appointment.appointmentId ? 'rotate-180' : ''}`} />
                                </div>
                           </div>
                           <div className="md:hidden mt-4 text-center">
                                <StatusBadge status={appointment.status} />
                           </div>
                        </div>

                        {expandedCard === appointment.appointmentId && (
                            <div className="px-5 md:px-6 pb-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 pt-4">
                                    {/* Column 1: Doctor Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Doctor Info</h3>
                                        <DetailRow icon={<Briefcase size={18}/>} label="Designation" value={appointment.designation} />
                                        <DetailRow icon={<GraduationCap size={18}/>} label="Qualification" value={appointment.qualification} />
                                        <DetailRow icon={<MapPin size={18}/>} label="Location" value={appointment.location} />
                                        <DetailRow icon={<Info size={18}/>} label="About" value={appointment.doctorInfo} />
                                    </div>
                                    {/* Column 2: Appointment Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Appointment Details</h3>
                                        <DetailRow icon={<Hash size={18}/>} label="Appointment ID" value={appointment.appointmentId} />
                                        <DetailRow icon={<Calendar size={18}/>} label="Schedule" value={`${formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).dayName}, ${formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).primaryDate}`} />
                                    </div>
                                    {/* Column 3: Patient Info & Actions */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Patient Info</h3>
                                        <DetailRow icon={<User size={18}/>} label="Patient Name" value={appointment.patientName} />
                                        <DetailRow icon={<Hash size={18}/>} label="Patient ID" value={appointment.patientId.toString()} />
                                        
                        {appointment.status.toLowerCase() === 'pending' && (
                                            <div className="pt-4">
                            <button
                                                onClick={() => handleCancel(appointment._id.toString())}
                                                className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
                            >
                                                Cancel Appointment
                            </button>
                                            </div>
                                        )}

                                        {appointment.status.toLowerCase() === 'done' && (
                                            <div className="pt-4 space-y-3">
                                                <div className="text-center">
                                                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200 mb-3">
                                                        ✓ Appointment Confirmed
                                                    </div>
                                                </div>
                                                
                                                {/* Payment Status Badge */}
                                                <div className="text-center mb-3">
                                                    <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                                                        appointment.paymentStatus === 'paid' 
                                                            ? 'bg-green-100 text-green-800 border-green-200' 
                                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                    }`}>
                                                        {(appointment.paymentStatus === 'paid') ? '💳 Paid' : '⏳ Payment Pending'}
                                                    </div>
                                                    {appointment.paymentStatus !== 'paid' && (
                                                        <p className="text-xs text-orange-600 font-medium mt-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                                                            You have to pay first to unlock the services
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => router.push(`/prescription/${appointment._id}`)}
                                                    className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                    View Prescription
                                                </button>
                                                
                                                <button
                                                    onClick={() => router.push(`/payment/${appointment._id}`)}
                                                    className="w-full px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                                    </svg>
                                                    Make Payment
                                                </button>
                                                
                                                {/* Meeting Status */}
                                                {appointment.meetingScheduled ? (
                                                    <div className="w-full px-4 py-3 bg-green-100 text-green-800 text-sm font-semibold rounded-lg border-2 border-green-200 text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <Video className="w-4 h-4" />
                                                            Meeting has been scheduled
                                                        </div>
                                                        <div className="flex items-center justify-center gap-2 text-xs">
                                                            Check your email for meeting link
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg border-2 border-gray-200 flex items-center justify-center gap-2">
                                                        <Video className="w-4 h-4" />
                                                        Meeting is not scheduled yet
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
            </div>
            </div>
        )}
      </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">No Appointments Found</h3>
                    <p className="text-gray-500 mt-2 mb-6">You don't have any appointments scheduled yet.</p>
                    <button
                        onClick={() => router.push('/doctor-list')}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                    >
                        Book an Appointment
                    </button>
                </div>
            )}
            </>
        )}
      </main>

      <footer className="bg-gray-800 text-white mt-12">
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