'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IAppointment } from '@/models/Appointment';
import { IPrescription } from '@/models/Prescription';
import { IPatient } from '@/models/Patient';
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
  History
} from 'lucide-react';

const AnimatedCounter = ({ value, prefix = "", suffix = "", inline = false }: { value: number, prefix?: string, suffix?: string, inline?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const counterRef = useRef<any>(null);

  // Intersection Observer to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Counting animation effect
  useEffect(() => {
    if (isVisible && value > 0) {
      setIsAnimating(true);
      let startTime: number;
      const duration = 2000; // 2 seconds animation
      const startValue = 0;
      const endValue = value;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isVisible, value]);

  const Element = inline ? 'span' : 'p';
  const className = inline 
    ? `transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}` 
    : `text-2xl font-bold transition-all duration-300 ${isAnimating ? 'animate-pulse scale-105' : ''}`;

  return (
    <Element 
      ref={counterRef}
      className={className}
    >
      {prefix}{displayValue}{suffix}
    </Element>
  );
};

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [patients, setPatients] = useState<{ [key: string]: IPatient }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/doctor');
    }
  };

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/doctor/login');
          return;
        }

        // Decode token to get doctor ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const doctorId = payload.id;
        
        // Fetch appointments for this doctor
        const appointmentsRes = await fetch(`/api/appointments?doctorId=${doctorId}`);
        const appointmentsData = await appointmentsRes.json();
        
        if (!appointmentsRes.ok) {
          throw new Error(appointmentsData.message || 'Failed to fetch appointments');
        }

        const completedAppointments = appointmentsData.data.filter(
          (apt: IAppointment) => apt.status === 'Done'
        );
        
        setAppointments(completedAppointments);
        
        if (completedAppointments.length > 0) {
          setDoctorName(completedAppointments[0].doctorName);
        }

        // Fetch prescriptions for each appointment
        const prescriptionPromises = completedAppointments.map(async (apt: IAppointment) => {
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

        // Fetch patient details for each appointment
        const patientPromises = completedAppointments.map(async (apt: IAppointment) => {
          try {
            const patientRes = await fetch(`/api/patients/${apt.patientId}`);
            const patientData = await patientRes.json();
            return { id: apt.patientId.toString(), data: patientData.data };
          } catch (err) {
            console.error('Error fetching patient:', apt.patientId, err);
            return { id: apt.patientId.toString(), data: null };
          }
        });

        const patientResults = await Promise.all(patientPromises);
        const patientMap: { [key: string]: IPatient } = {};
        patientResults.forEach(({ id, data }) => {
          if (data) patientMap[id] = data;
        });
        setPatients(patientMap);

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

  const totalPatients = new Set(appointments.map(apt => apt.patientId.toString())).size;
  const totalEarnings = appointments
    .filter(apt => apt.paymentStatus === 'paid')
    .reduce((sum, apt) => sum + (apt.paymentAmount || 0), 0);
  const totalPrescriptions = prescriptions.length;

  const getPrescriptionForAppointment = (appointmentId: string) => {
    return prescriptions.find(p => p.appointmentId.toString() === appointmentId);
  };

  const getPatientForAppointment = (patientId: string) => {
    return patients[patientId];
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
        <div className="flex items-center gap-4">
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Medical History</h1>
          {doctorName && (
            <p className="text-lg text-gray-500">
              {doctorName}, here's your consultation history and patient records
            </p>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <div className="text-blue-600">
                  <AnimatedCounter value={totalPatients} />
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <div className="text-green-600">
                  <AnimatedCounter value={totalEarnings} prefix="৳" />
                </div>
              </div>
              <Banknote className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <div className="text-purple-600">
                  <AnimatedCounter value={totalPrescriptions} />
                </div>
              </div>
              <Pill className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <div className="text-orange-600">
                  <AnimatedCounter value={appointments.length} />
                </div>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
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
                All (<AnimatedCounter value={appointments.length} inline={true} />)
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'paid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid (<AnimatedCounter value={appointments.filter(a => a.paymentStatus === 'paid').length} inline={true} />)
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unpaid' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unpaid (<AnimatedCounter value={appointments.filter(a => a.paymentStatus === 'unpaid').length} inline={true} />)
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
                      ? "You haven't completed any consultations yet." 
                      : `No ${filter} appointments found.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAppointments.map((appointment) => {
                  const patient = getPatientForAppointment(appointment.patientId.toString());
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
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {appointment.patientName}
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
                                  {prescription ? 'Given' : 'Not Given'}
                                </span>
                              </span>
                            </div>
                          </div>

                        {isExpanded && (
                          <div className="border-t pt-4 space-y-4">
                            {/* Patient Details */}
                            {patient && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Patient Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-800 font-semibold">Email:</span>
                                    <span className="ml-2 font-medium text-gray-900">{patient.email}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Phone:</span>
                                    <span className="ml-2 font-medium text-gray-900">{patient.phone}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Gender:</span>
                                    <span className="ml-2 font-medium text-gray-900">{patient.gender}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-semibold">Age:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-gray-800 font-semibold">Address:</span>
                                    <span className="ml-2 font-medium text-gray-900">{patient.address}</span>
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
    </div>
  );
}  