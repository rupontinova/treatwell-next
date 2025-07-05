'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IAppointment } from '@/models/Appointment';
import { IPrescription } from '@/models/Prescription';
import { IDoctor } from '@/models/Doctor';
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  FileText, 
  Eye, 
  ArrowLeft, 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  TrendingUp, 
  Users, 
  Banknote,
  Pill,
  History,
  UserCheck,
  CreditCard,
  FileTextIcon,
  ClipboardList
} from 'lucide-react';

export default function PatientMedicalHistoryPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [doctors, setDoctors] = useState<{ [key: string]: IDoctor }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Decode token to get patient ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const patientId = payload.id;
        
        // Fetch patient info
        const patientRes = await fetch(`/api/patients/${patientId}`);
        if (patientRes.ok) {
          const patientData = await patientRes.json();
          setPatientName(patientData.data.fullName);
        }
        
        // Fetch appointments for this patient
        const appointmentsRes = await fetch(`/api/appointments?patientId=${patientId}`);
        const appointmentsData = await appointmentsRes.json();
        
        if (!appointmentsRes.ok) {
          throw new Error(appointmentsData.message || 'Failed to fetch appointments');
        }

        const allAppointments = appointmentsData.data;
        setAppointments(allAppointments);

        // Fetch prescriptions for each appointment
        const prescriptionPromises = allAppointments.map(async (apt: IAppointment) => {
          try {
            const prescRes = await fetch(`/api/prescriptions?appointmentId=${apt._id}`);
            const prescData = await prescRes.json();
            return prescData.success ? prescData.data : null;
          } catch (err) {
            console.error('Error fetching prescription for appointment:', apt._id, err);
            return null;
          }
        });

        const prescriptionResults = await Promise.all(prescriptionPromises);
        const validPrescriptions = prescriptionResults.filter(p => p !== null);
        setPrescriptions(validPrescriptions);

        // Fetch doctor details for each appointment
        const doctorPromises = allAppointments.map(async (apt: IAppointment) => {
          try {
            const doctorRes = await fetch(`/api/doctors/${apt.doctorId}`);
            const doctorData = await doctorRes.json();
            return { id: apt.doctorId.toString(), data: doctorData.data };
          } catch (err) {
            console.error('Error fetching doctor:', apt.doctorId, err);
            return { id: apt.doctorId.toString(), data: null };
          }
        });

        const doctorResults = await Promise.all(doctorPromises);
        const doctorMap: { [key: string]: IDoctor } = {};
        doctorResults.forEach(({ id, data }) => {
          if (data) doctorMap[id] = data;
        });
        setDoctors(doctorMap);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [router]);

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'paid') return apt.paymentStatus === 'paid';
    if (filter === 'unpaid') return apt.paymentStatus === 'unpaid';
    return true;
  });

  const totalDoctors = new Set(appointments.map(apt => apt.doctorId.toString())).size;
  const totalSpent = appointments
    .filter(apt => apt.paymentStatus === 'paid')
    .reduce((sum, apt) => sum + (apt.paymentAmount || 0), 0);
  const totalPrescriptions = prescriptions.length;

  const getPrescriptionForAppointment = (appointmentId: string) => {
    return prescriptions.find(p => p.appointmentId.toString() === appointmentId);
  };

  const getDoctorForAppointment = (doctorId: string) => {
    return doctors[doctorId];
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <History className="w-5 h-5" />
            <span className="font-medium">My Medical History</span>
          </div>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-gray-100"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">My Medical History</h1>
          {patientName && (
            <p className="text-lg text-gray-500">
              Hello {patientName}, here's your complete medical history and consultation records
            </p>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doctors Consulted</p>
                <p className="text-2xl font-bold text-blue-600">{totalDoctors}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">৳{totalSpent}</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-purple-600">{totalPrescriptions}</p>
              </div>
              <Pill className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-green-600">{appointments.length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by Payment:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({appointments.length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'paid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid ({appointments.filter(a => a.paymentStatus === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unpaid' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unpaid ({appointments.filter(a => a.paymentStatus === 'unpaid').length})
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg font-medium text-gray-600 mt-4">Loading your medical history...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-lg font-medium text-red-500">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Medical History Found</h3>
                  <p className="text-gray-500">
                    {filter === 'all' 
                      ? "You haven't had any appointments yet." 
                      : `No ${filter} appointments found.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAppointments.map((appointment) => {
                  const doctor = getDoctorForAppointment(appointment.doctorId.toString());
                  const prescription = getPrescriptionForAppointment(appointment._id.toString());
                  const isExpanded = expandedCard === appointment._id.toString();
                  
                  return (
                    <div
                      key={appointment._id.toString()}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Stethoscope className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                Dr. {appointment.doctorName}
                              </h3>
                              <p className="text-gray-700 text-sm font-medium">
                                {appointment.appointmentDate} • {appointment.appointmentTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'Done'
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                            <button
                              onClick={() => setExpandedCard(
                                isExpanded ? null : appointment._id.toString()
                              )}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-800">
                              Fee: <span className="font-semibold text-gray-900">৳{appointment.paymentAmount || 0}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-800">
                              Speciality: <span className="font-semibold text-gray-900">{appointment.speciality}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-800">
                              Prescription: <span className="font-semibold text-gray-900">
                                {prescription ? 'Received' : 'Not Given'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t pt-4 space-y-4">
                            {/* Doctor Details */}
                            {doctor && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Doctor Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-800 font-semibold">Name:</span>
                                    <span className="ml-2 font-medium text-gray-900">Dr. {doctor.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Speciality:</span>
                                    <span className="ml-2 font-medium text-gray-900">{doctor.speciality}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Qualification:</span>
                                    <span className="ml-2 font-medium text-gray-900">{doctor.qualification}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Phone:</span>
                                    <span className="ml-2 font-medium text-gray-900">{doctor.phone}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-gray-800 font-semibold">Location:</span>
                                    <span className="ml-2 font-medium text-gray-900">{doctor.location}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Prescription Details */}
                            {prescription && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Prescription Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-800 font-semibold">Diagnosis:</span>
                                    <span className="ml-2 font-medium text-gray-900">{prescription.diagnosis}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Chief Complaint:</span>
                                    <span className="ml-2 font-medium text-gray-900">{prescription.chiefComplaint}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Medications:</span>
                                    <div className="mt-2 space-y-2">
                                      {prescription.medications.map((med, index) => (
                                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                          <div className="flex flex-col space-y-1">
                                            <span className="font-semibold text-gray-900 text-sm">{med.name}</span>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                <strong>Dosage:</strong>&nbsp;{med.dosage}
                                              </span>
                                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                <strong>Frequency:</strong>&nbsp;{med.frequency}
                                              </span>
                                              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                                <strong>Duration:</strong>&nbsp;{med.duration}
                                              </span>
                                            </div>
                                            {med.instructions && (
                                              <p className="text-xs text-gray-600 mt-1 italic">
                                                <strong>Instructions:</strong> {med.instructions}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {prescription.generalInstructions && (
                                    <div>
                                      <span className="text-gray-800 font-semibold">General Instructions:</span>
                                      <span className="ml-2 font-medium text-gray-900">{prescription.generalInstructions}</span>
                                    </div>
                                  )}
                                  {prescription.nextVisitDate && (
                                    <div>
                                      <span className="text-gray-800 font-semibold">Next Visit:</span>
                                      <span className="ml-2 font-medium text-gray-900">{prescription.nextVisitDate}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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