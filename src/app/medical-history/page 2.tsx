'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IAppointment } from '@/models/Appointment';
import { IPrescription } from '@/models/Prescription';
import { Calendar, Clock, User, MapPin, Stethoscope, Hash, AlertTriangle, CheckCircle, XCircle, Briefcase, GraduationCap, Info, ChevronDown, Video, Mail, ArrowLeft, FileText, CreditCard, Activity, Eye } from 'lucide-react';

interface MedicalHistoryData {
  appointments: IAppointment[];
  prescriptions: IPrescription[];
  doctorStats: {
    doctorName: string;
    speciality: string;
    visitCount: number;
    lastVisit: string;
  }[];
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<MedicalHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'doctors'>('overview');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view medical history.');
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
        const res = await fetch(`/api/medical-history?patientId=${patientId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch medical history');
        }
        setHistoryData(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicalHistory();
  }, [router]);

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

  const formatDateDisplay = (appointmentDate: string, appointmentDay: string) => {
    try {
      if (!appointmentDate || appointmentDate === 'undefined' || appointmentDate === 'null') {
        return {
          primaryDate: 'No Date',
          dayName: appointmentDay || 'Unknown Day'
        };
      }

      let date: Date;
      const parts = appointmentDate.split('/');
      
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(appointmentDate);
      }
      
      if (isNaN(date.getTime())) {
        return {
          primaryDate: appointmentDate,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your medical history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Medical History Not Available</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/appointments')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
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
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Medical History</h1>
          {patientName && <p className="text-lg text-gray-500">Complete medical records for {patientName}</p>}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8 p-2">
          <nav className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'appointments', label: 'Appointments', icon: Calendar },
              { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
              { key: 'doctors', label: 'Doctors', icon: Stethoscope }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && historyData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{historyData.appointments.length}</h3>
              <p className="text-gray-600">Total Appointments</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {historyData.appointments.filter(apt => apt.status.toLowerCase() === 'done').length}
              </h3>
              <p className="text-gray-600">Completed Visits</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <FileText className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{historyData.prescriptions.length}</h3>
              <p className="text-gray-600">Prescriptions</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Stethoscope className="w-8 h-8 mx-auto text-red-600 mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{historyData.doctorStats.length}</h3>
              <p className="text-gray-600">Doctors Consulted</p>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && historyData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment History</h2>
            {historyData.appointments.map((appointment) => (
              <div key={appointment.appointmentId} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 cursor-pointer" onClick={() => setExpandedCard(expandedCard === appointment.appointmentId ? null : appointment.appointmentId)}>
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{appointment.doctorName}</h2>
                      <p className="text-md text-blue-600 font-medium flex items-center mt-1">
                        <Stethoscope className="w-4 h-4 mr-2" />{appointment.speciality}
                      </p>
                    </div>
                    
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Appointment Details</h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>ID:</strong> {appointment.appointmentId}</p>
                          <p><strong>Location:</strong> {appointment.location}</p>
                          <p><strong>Payment:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              appointment.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.paymentStatus === 'paid' ? `Paid ৳${appointment.paymentAmount}` : 'Unpaid'}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Doctor Information</h3>
                        <div className="space-y-2 text-sm">
                          <p><strong>Designation:</strong> {appointment.designation}</p>
                          <p><strong>Qualification:</strong> {appointment.qualification}</p>
                          <p><strong>About:</strong> {appointment.doctorInfo}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
                        <div className="space-y-2">
                          {appointment.status.toLowerCase() === 'done' && (
                            <>
                              <button
                                onClick={() => router.push(`/prescription/${appointment._id}`)}
                                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                View Prescription
                              </button>
                              <button
                                onClick={() => router.push(`/payment/${appointment._id}`)}
                                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                View Payment
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && historyData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescription History</h2>
            {historyData.prescriptions.map((prescription) => (
              <div key={prescription.prescriptionId} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dr. {prescription.doctorName}</h3>
                    <p className="text-blue-600 font-medium">{prescription.doctorSpeciality}</p>
                    <p className="text-sm text-gray-500">Date: {prescription.prescriptionDate}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/prescription/${prescription.appointmentId}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Full
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{prescription.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Chief Complaint</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{prescription.chiefComplaint}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Medications ({prescription.medications.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prescription.medications.slice(0, 4).map((med, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-900">{med.name}</p>
                        <p className="text-sm text-blue-700">{med.dosage} - {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                  {prescription.medications.length > 4 && (
                    <p className="text-sm text-gray-500 mt-2">+ {prescription.medications.length - 4} more medications</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && historyData && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctors Consulted</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyData.doctorStats.map((doctor, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.doctorName}</h3>
                    <p className="text-blue-600 font-medium mb-2">{doctor.speciality}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{doctor.visitCount}</p>
                          <p className="text-xs text-gray-600">Visits</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{doctor.lastVisit}</p>
                          <p className="text-xs text-gray-600">Last Visit</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/doctor-list?name=${doctor.doctorName}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {historyData && historyData.appointments.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Medical History Found</h3>
            <p className="text-gray-500 mt-2 mb-6">You haven't had any appointments yet.</p>
            <button
              onClick={() => router.push('/doctor-list')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 