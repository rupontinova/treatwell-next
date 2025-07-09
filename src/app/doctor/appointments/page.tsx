'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAppointment } from '@/models/Appointment';
import { Calendar, Clock, User, MapPin, Stethoscope, Hash, AlertTriangle, CheckCircle, XCircle, Briefcase, GraduationCap, Info, ChevronDown, Phone, Video, ArrowLeft } from 'lucide-react';
import MeetingModal from '@/components/MeetingModal';

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/doctor');
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view appointments.');
        setLoading(false);
        router.push('/doctor/login');
        return;
      }

      try {
        // Decode JWT token to get doctor info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const doctorId = payload.id;

        if (!doctorId) {
          setError('Could not find your doctor ID.');
          setLoading(false);
          return;
        }

        // Add cache-busting parameter to ensure fresh data
        const cacheBreaker = new Date().getTime();
        const res = await fetch(`/api/appointments?doctorId=${doctorId}&t=${cacheBreaker}`, {
          cache: 'no-store', // Force fresh fetch
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch appointments');
        }
        
        // Get doctor name from welcome message or fetch from API
        const welcomeMessage = localStorage.getItem('welcomeMessage');
        if (welcomeMessage) {
          setDoctorName(welcomeMessage.replace('Welcome, ', ''));
        }

        // Sort appointments by creation date (newest first) using ObjectId timestamp
        const sortedAppointments = data.data.sort((a: any, b: any) => {
          const timeA = parseInt(a._id.toString().substring(0, 8), 16);
          const timeB = parseInt(b._id.toString().substring(0, 8), 16);
          return timeB - timeA;
        });
        setAppointments(sortedAppointments);
        setError(''); // Clear any previous errors
        
        // Check if we should show a success message (coming back from prescription)
        const shouldRefresh = localStorage.getItem('refreshAppointments');
        if (shouldRefresh) {
          setSuccessMessage('Prescription saved successfully! Appointments refreshed.');
          localStorage.removeItem('refreshAppointments');
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [router]);



  const handleStatusUpdate = async (appointmentId: string, newStatus: 'Done' | 'Declined') => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update appointment status');
      }

      // Update the appointments list
      setAppointments(appointments.map(apt => 
        apt._id.toString() === appointmentId 
          ? { ...apt, status: newStatus } as IAppointment
          : apt
      ));

      const actionText = newStatus === 'Done' ? 'confirmed' : 'declined';
      setSuccessMessage(`Appointment has been successfully ${actionText}!`);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMeetingLink = async (appointmentId: string, meetingTime: string, meetingLink: string) => {
    try {
      const res = await fetch('/api/appointments/meeting-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          meetingTime,
          meetingLink
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send meeting link');
      }

      // Update the appointments list to reflect meeting scheduled
      setAppointments(appointments.map(apt => 
        apt._id.toString() === appointmentId 
          ? { ...apt, meetingScheduled: true, meetingTime, meetingLink, meetingEmailSent: data.success } as IAppointment
          : apt
      ));

      setSuccessMessage('Meeting link sent successfully to the patient!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const openMeetingModal = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setShowMeetingModal(true);
  };

  const closeMeetingModal = () => {
    setShowMeetingModal(false);
    setSelectedAppointment(null);
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
          onClick={() => router.push('/doctor')}
        >
          TreatWell
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/doctor/appointments")}>
            Appointments
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/doctor/medical-history")}>
            Medical History
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/doctor/profile")}>
            Profile
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
            {doctorName && <p className="text-lg text-gray-500">Hello, {doctorName}! Here are your scheduled appointments.</p>}

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
                                {/* Left: Patient Info */}
                                <div className="flex-1 mb-4 md:mb-0">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{appointment.patientName}</h2>
                                    <p className="text-md text-blue-600 font-medium flex items-center mt-1"><User className="w-4 h-4 mr-2" />Patient Appointment</p>
                                </div>
                                
                                {/* Center: Date & Time - Prominent Display */}
                                <div className="flex-1 text-center bg-blue-50 rounded-lg p-4 mx-0 md:mx-6 mb-4 md:mb-0 border border-blue-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Date & Day</p>
                                            <div className="font-bold text-blue-800">
                                                <p className="text-sm leading-tight">{formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).dayName}</p>
                                                <p className="text-xs text-blue-600">{formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).primaryDate}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Time</p>
                                            <p className="font-bold text-blue-800 text-sm">{appointment.appointmentTime}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right: Status & Controls */}
                                <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-end">
                                    <div className="mb-2">
                                        <StatusBadge status={appointment.status} />
                                    </div>
                                    <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${expandedCard === appointment.appointmentId ? 'rotate-180' : ''}`} />
                                </div>
                           </div>
                        </div>

                        {expandedCard === appointment.appointmentId && (
                            <div className="px-5 md:px-6 pb-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 pt-4">
                                    {/* Column 1: Patient Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Patient Info</h3>
                                        <DetailRow icon={<User size={18}/>} label="Patient Name" value={appointment.patientName} />
                                        <DetailRow icon={<Hash size={18}/>} label="Patient ID" value={appointment.patientId.toString()} />
                                    </div>
                                    {/* Column 2: Appointment Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Appointment Details</h3>
                                        <DetailRow icon={<Hash size={18}/>} label="Appointment ID" value={appointment.appointmentId} />
                                        <DetailRow icon={<Calendar size={18}/>} label="Schedule" value={`${formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).dayName}, ${formatDateDisplay(appointment.appointmentDate, appointment.appointmentDay).primaryDate}`} />
                                        <DetailRow icon={<Clock size={18}/>} label="Time" value={appointment.appointmentTime} />
                                        <DetailRow icon={<MapPin size={18}/>} label="Location" value={appointment.location} />
                                    </div>
                                    {/* Column 3: Doctor Info & Actions */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Your Details</h3>
                                        <DetailRow icon={<Stethoscope size={18}/>} label="Speciality" value={appointment.speciality} />
                                        <DetailRow icon={<Briefcase size={18}/>} label="Designation" value={appointment.designation} />
                                        <DetailRow icon={<GraduationCap size={18}/>} label="Qualification" value={appointment.qualification} />
                                        
                        {appointment.status.toLowerCase() === 'pending' && (
                                            <div className="pt-4 space-y-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(appointment._id.toString(), 'Done');
                                                    }}
                                                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                                                >
                                                    ✓ Accept Appointment
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(appointment._id.toString(), 'Declined');
                                                    }}
                                                    className="w-full px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
                                                >
                                                    ✗ Decline Appointment
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
                                                
                                                {/* Payment Status Display */}
                                                <div className="text-center mb-3">
                                                    <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                                                        appointment.paymentStatus === 'paid' 
                                                            ? 'bg-green-100 text-green-800 border-green-200' 
                                                            : 'bg-red-100 text-red-800 border-red-200'
                                                    }`}>
                                                        {appointment.paymentStatus === 'paid' ? '💰 Payment Complete' : '⚠️ Payment Pending'}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (appointment.paymentStatus !== 'paid') {
                                                            alert('Patient must complete payment before prescription can be written. Please ask the patient to pay first.');
                                                            return;
                                                        }
                                                        router.push(`/doctor/prescription/${appointment._id}`);
                                                    }}
                                                    disabled={appointment.paymentStatus !== 'paid'}
                                                    className={`w-full px-4 py-3 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                                                        appointment.paymentStatus === 'paid'
                                                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                                            : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                    {appointment.paymentStatus === 'paid' ? 'Write Prescription' : 'Payment Required'}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/doctor/payment/${appointment._id}`);
                                                    }}
                                                    className="w-full px-4 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                                    </svg>
                                                    View Payment
                                                </button>
                                                
                                                {/* Meeting Link Button */}
                                                {appointment.meetingScheduled ? (
                                                    <div className="w-full px-4 py-3 bg-purple-100 text-purple-800 text-sm font-semibold rounded-lg border-2 border-purple-200 flex items-center justify-center gap-2">
                                                        <Video className="w-4 h-4" />
                                                        Meeting has been scheduled
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (appointment.paymentStatus !== 'paid') {
                                                                alert('Patient must complete payment before meeting link can be sent. Please ask the patient to pay first.');
                                                                return;
                                                            }
                                                            openMeetingModal(appointment);
                                                        }}
                                                        disabled={appointment.paymentStatus !== 'paid'}
                                                        className={`w-full px-4 py-3 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                                                            appointment.paymentStatus === 'paid'
                                                                ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                                                                : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        {appointment.paymentStatus === 'paid' ? 'Send Meeting Link' : 'Payment Required'}
                                                    </button>
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
                </div>
            )}
            </>
        )}
      </main>
      
      {/* Meeting Modal */}
      {selectedAppointment && (
        <MeetingModal
          isOpen={showMeetingModal}
          onClose={closeMeetingModal}
          appointmentId={selectedAppointment._id.toString()}
          patientName={selectedAppointment.patientName}
          appointmentDate={selectedAppointment.appointmentDate}
          appointmentTime={selectedAppointment.appointmentTime}
          onSendMeetingLink={handleSendMeetingLink}
        />
      )}

      <footer className="bg-gray-800 text-white mt-12">
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
                <li><button onClick={() => router.push("/doctor/appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => router.push("/doctor/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => router.push("/doctor/profile")} className="text-gray-400 hover:text-white transition">Profile</button></li>
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
               <p className="text-gray-400 mb-2 text-sm">Help us improve our services.</p>
              <button 
                onClick={() => router.push("/feedback")}
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