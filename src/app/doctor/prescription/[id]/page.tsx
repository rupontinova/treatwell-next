'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IAppointment } from '@/models/Appointment';
import { IPatient } from '@/models/Patient';
import { IDoctor } from '@/models/Doctor';
import { Calendar, Clock, User, Phone, Plus, Trash2, Save, FileText, ArrowLeft } from 'lucide-react';

interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Prescription form state
  const [diagnosis, setDiagnosis] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [medications, setMedications] = useState<IMedication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  useEffect(() => {
    const fetchAppointmentData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/doctor/login');
        return;
      }

      try {
        // Fetch appointment details
        const appointmentRes = await fetch(`/api/appointments/${appointmentId}`);
        if (!appointmentRes.ok) {
          throw new Error('Failed to fetch appointment');
        }
        const appointmentData = await appointmentRes.json();
        const appointmentInfo = appointmentData.data;
        setAppointment(appointmentInfo);

        // Check payment status - doctor can only write prescription if payment is made
        if (appointmentInfo.paymentStatus !== 'paid') {
          setError('Patient must complete payment before prescription can be written. Please ask the patient to pay first.');
          return;
        }

        // Fetch patient details using patientId from appointment
        if (appointmentInfo.patientId) {
          try {
            const patientRes = await fetch(`/api/patients/${appointmentInfo.patientId}`);
            if (patientRes.ok) {
              const patientData = await patientRes.json();
              setPatient(patientData.data);
            }
          } catch (patientErr) {
            console.error('Error fetching patient data:', patientErr);
          }
        }

        // Check if prescription already exists
        const prescriptionRes = await fetch(`/api/prescriptions?appointmentId=${appointmentId}`);
        if (prescriptionRes.ok) {
          const prescriptionData = await prescriptionRes.json();
          if (prescriptionData.data) {
            // Pre-fill form with existing prescription data
            const prescription = prescriptionData.data;
            setDiagnosis(prescription.diagnosis || '');
            setChiefComplaint(prescription.chiefComplaint || '');
            setMedications(prescription.medications || [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setGeneralInstructions(prescription.generalInstructions || '');
            setNextVisitDate(prescription.nextVisitDate || '');

          }
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [appointmentId, router]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof IMedication, value: string) => {
    const updatedMedications = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updatedMedications);
  };

  const calculateAge = (dob: string | Date) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSavePrescription = async () => {
    if (!appointment) return;

    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!diagnosis.trim() || !chiefComplaint.trim()) {
        throw new Error('Please fill in diagnosis and chief complaint');
      }

      if (medications.some(med => !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim())) {
        throw new Error('Please fill in all medication fields');
      }

      const prescriptionData = {
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientAge: patient ? calculateAge(patient.dob) : 0,
        patientGender: patient?.gender || '',
        patientPhone: patient?.phone || '',
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        doctorSpeciality: appointment.speciality,
        doctorQualification: appointment.qualification,
        doctorDesignation: appointment.designation,
        diagnosis: diagnosis.trim(),
        chiefComplaint: chiefComplaint.trim(),
        medications: medications.filter(med => med.name.trim()),
        generalInstructions: generalInstructions.trim(),
        nextVisitDate: nextVisitDate
      };

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save prescription');
      }

      setSuccessMessage('Prescription saved successfully! Redirecting to appointments...');
      
      // Add a flag to localStorage to indicate that data should be refreshed
      localStorage.setItem('refreshAppointments', 'true');
      
      setTimeout(() => {
        router.push('/doctor/appointments');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={() => router.push('/doctor/appointments')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Appointments
          </button>
        </div>
        <div className="text-3xl font-bold text-blue-600">TreatWell</div>
        <div className="flex items-center gap-2 text-gray-600">
          <FileText className="w-5 h-5" />
          <span className="font-medium">Write Prescription</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium text-center">
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">
            ❌ {error}
          </div>
        )}

        {/* Prescription Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Prescription</h1>
            <p className="text-gray-500">TreatWell Healthcare Platform</p>
          </div>

          {/* Doctor & Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Doctor Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800 font-medium">{appointment?.doctorName}</span></p>
                <p><span className="font-medium text-gray-600">Speciality:</span> <span className="text-gray-800 font-medium">{appointment?.speciality}</span></p>
                <p><span className="font-medium text-gray-600">Qualification:</span> <span className="text-gray-800 font-medium">{appointment?.qualification}</span></p>
                <p><span className="font-medium text-gray-600">Designation:</span> <span className="text-gray-800 font-medium">{appointment?.designation}</span></p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-800 font-medium">{appointment?.patientName}</span></p>
                <p><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-800 font-medium">{patient ? calculateAge(patient.dob) : 'N/A'} years</span></p>
                <p><span className="font-medium text-gray-600">Gender:</span> <span className="text-gray-800 font-medium">{patient?.gender || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800 font-medium">{patient?.phone || 'N/A'}</span></p>
                <p><span className="font-medium text-gray-600">Date:</span> <span className="text-gray-800 font-medium">{appointment?.appointmentDate}</span></p>

              </div>
            </div>
          </div>

          {/* Prescription Form */}
          <div className="space-y-6">
            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-500"
                rows={2}
                placeholder="Patient's main symptoms or complaints..."
                required
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-500"
                rows={2}
                placeholder="Medical diagnosis..."
                required
              />
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medications <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={addMedication}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Medicine Name</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                        placeholder="e.g., Paracetamol"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                        placeholder="e.g., 3 times daily"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {medications.length > 1 && (
                        <button
                          onClick={() => removeMedication(index)}
                          className="w-full px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">General Instructions</label>
              <textarea
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-500"
                rows={3}
                placeholder="General instructions for the patient..."
              />
            </div>

            {/* Next Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Visit Date</label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSavePrescription}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 