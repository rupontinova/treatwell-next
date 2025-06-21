'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, User, Phone, MapPin, Briefcase, GraduationCap, ArrowLeft, Download, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { IAppointment } from '@/models/Appointment';
import jsPDF from 'jspdf';

export default function DoctorPaymentViewPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Recommended fee is always 1000
  const RECOMMENDED_FEE = 1000;

  useEffect(() => {
    const fetchAppointment = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/doctor/login');
        return;
      }

      try {
        // Decode JWT to verify doctor
        const payload = JSON.parse(atob(token.split('.')[1]));
        const doctorId = payload.id;

        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch appointment');
        }
        
        const data = await res.json();
        if (!data.success || !data.data) {
          throw new Error('Appointment not found');
        }
        
        // Verify this appointment belongs to the logged-in doctor
        if (data.data.doctorId.toString() !== doctorId) {
          throw new Error('You are not authorized to view this appointment');
        }
        
        setAppointment(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, router]);

  const downloadPaymentReport = () => {
    if (!appointment) return;
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('Payment Report - Doctor View', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(107, 114, 128);
    pdf.text('TreatWell Healthcare Platform', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Appointment Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Appointment Details', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Appointment ID: ${appointment.appointmentId}`, margin, yPos);
    yPos += 5;
    pdf.text(`Date: ${appointment.appointmentDate}`, margin, yPos);
    yPos += 5;
    pdf.text(`Time: ${appointment.appointmentTime}`, margin, yPos);
    yPos += 15;

    // Patient Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${appointment.patientName}`, margin, yPos);
    yPos += 5;
    pdf.text(`Patient ID: ${appointment.patientId}`, margin, yPos);
    yPos += 15;

    // Doctor Info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Doctor Information', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Doctor: ${appointment.doctorName}`, margin, yPos);
    yPos += 5;
    pdf.text(`Speciality: ${appointment.speciality}`, margin, yPos);
    yPos += 5;
    pdf.text(`Qualification: ${appointment.qualification}`, margin, yPos);
    yPos += 15;

    // Payment Details
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
    yPos += 5;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Details', margin + 5, yPos);
    yPos += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Payment Status: ${appointment.paymentStatus.toUpperCase()}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Consultation Fee: ৳${appointment.paymentAmount || 0}`, margin + 5, yPos);
    yPos += 5;
    if (appointment.paymentDate) {
      pdf.text(`Payment Date: ${new Date(appointment.paymentDate).toLocaleDateString('en-GB')}`, margin + 5, yPos);
    }
    yPos += 15;

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('TreatWell Healthcare Platform - Doctor Dashboard', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth / 2, footerY + 4, { align: 'center' });

    const fileName = `Payment_Report_${appointment.appointmentId}_${appointment.patientName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Information Not Available</h3>
          <p className="text-red-500 mb-4">{error || 'Appointment not found'}</p>
          <button 
            onClick={() => router.push('/doctor/appointments')} 
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
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadPaymentReport}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Details</h1>
          <p className="text-lg text-gray-600">View payment information for this appointment</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Payment Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${
              appointment.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                : 'bg-red-100 text-red-800 border-2 border-red-200'
            }`}>
              {appointment.paymentStatus === 'paid' ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Payment Completed
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 mr-2" />
                  Payment Pending
                </>
              )}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Patient Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800 font-medium">{appointment.patientName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{appointment.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{appointment.appointmentTime}</span>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Doctor Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800 font-medium">{appointment.doctorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{appointment.speciality}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{appointment.qualification}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{appointment.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-2 border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommended Consultation Fee:</span>
                <span className="text-lg font-semibold text-green-600">৳{RECOMMENDED_FEE}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`text-lg font-semibold ${
                  appointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {appointment.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                </span>
              </div>

              {appointment.paymentStatus === 'paid' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="text-lg font-semibold text-blue-600">৳{appointment.paymentAmount || 0}</span>
                  </div>

                  {appointment.paymentDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {new Date(appointment.paymentDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{appointment.paymentStatus === 'paid' ? (appointment.paymentAmount || 0) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Information */}
          {appointment.paymentStatus === 'unpaid' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <h4 className="text-lg font-semibold text-red-800">Payment Not Completed</h4>
              </div>
              <p className="text-red-600 mb-4">
                The patient has not yet completed the payment for this consultation. You cannot write a prescription until payment is received.
              </p>
              <p className="text-sm text-red-500">
                Please inform the patient to complete their payment of ৳{RECOMMENDED_FEE} to proceed with the consultation.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h4 className="text-lg font-semibold text-green-800">Payment Complete</h4>
              </div>
              <p className="text-green-600 mb-2">
                Payment of ৳{appointment.paymentAmount || RECOMMENDED_FEE} was successfully received
              </p>
              {appointment.paymentDate && (
                <p className="text-sm text-green-500">
                  Paid on: {new Date(appointment.paymentDate).toLocaleDateString('en-GB')}
                </p>
              )}
              
              {/* Action Buttons after Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={downloadPaymentReport}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
                
                <button
                  onClick={() => router.push(`/doctor/prescription/${appointment._id}`)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Write Prescription
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 