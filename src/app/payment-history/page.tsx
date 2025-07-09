'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IAppointment } from '@/models/Appointment';
import { Calendar, Clock, User, Download, CreditCard, ArrowLeft, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view payment history.');
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
          throw new Error(data.message || 'Failed to fetch payment history');
        }
        
        // Filter only confirmed appointments with payments
        const paidAppointments = data.data.filter((apt: IAppointment) => 
          apt.status.toLowerCase() === 'done'
        );
        
        // Sort payments by creation date (newest first) using ObjectId timestamp
        const sortedPayments = paidAppointments.sort((a: any, b: any) => {
          const timeA = parseInt(a._id.toString().substring(0, 8), 16);
          const timeB = parseInt(b._id.toString().substring(0, 8), 16);
          return timeB - timeA;
        });
        setAppointments(sortedPayments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [router]);

  const downloadInvoice = (appointment: IAppointment) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('Payment Invoice', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(107, 114, 128);
    pdf.text('TreatWell Healthcare Platform', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // Invoice Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Details', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice ID: ${appointment.appointmentId}`, margin, yPos);
    yPos += 5;
    pdf.text(`Payment Date: ${appointment.paymentDate ? new Date(appointment.paymentDate).toLocaleDateString('en-GB') : 'N/A'}`, margin, yPos);
    yPos += 5;
    pdf.text(`Payment Status: ${appointment.paymentStatus.toUpperCase()}`, margin, yPos);
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

    // Appointment Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Appointment Details', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${appointment.appointmentDate}`, margin, yPos);
    yPos += 5;
    pdf.text(`Time: ${appointment.appointmentTime}`, margin, yPos);
    yPos += 5;
    pdf.text(`Location: ${appointment.location}`, margin, yPos);
    yPos += 15;

    // Payment Details
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 20, 'F');
    yPos += 5;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Details', margin + 5, yPos);
    yPos += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Consultation Fee: ৳${appointment.paymentAmount}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Total Amount: ৳${appointment.paymentAmount}`, margin + 5, yPos);
    yPos += 15;

    // Footer
    const footerY = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Thank you for choosing TreatWell Healthcare Platform.', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth / 2, footerY + 4, { align: 'center' });

    const fileName = `Invoice_${appointment.appointmentId}_${appointment.patientName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment History Not Available</h3>
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
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/appointments')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Appointments
          </button>
        </div>
        <div></div>
        <div
          onClick={() => router.push('/')}
          className="text-2xl font-bold text-blue-600 cursor-pointer select-none hover:text-blue-700 transition-colors"
        >
          TreatWell
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
          <p className="text-lg text-gray-600">View all your payment records and download invoices</p>
          {patientName && <p className="text-md text-gray-500 mt-2">Patient: {patientName}</p>}
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment.appointmentId} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{appointment.doctorName}</h3>
                      <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${
                        appointment.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {appointment.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-1">{appointment.speciality}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <span>৳{appointment.paymentAmount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="text-right sm:text-left">
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-semibold text-gray-800">
                        {appointment.paymentDate 
                          ? new Date(appointment.paymentDate).toLocaleDateString('en-GB')
                          : 'Not Paid'
                        }
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/payment/${appointment._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Details
                      </button>
                      
                      {appointment.paymentStatus === 'paid' && (
                        <button
                          onClick={() => downloadInvoice(appointment)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Payment History</h3>
            <p className="text-gray-500 mb-6">You haven't made any payments yet.</p>
            <button
              onClick={() => router.push('/appointments')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              View Appointments
            </button>
          </div>
        )}

        {/* Summary */}
        {appointments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.length}
                </p>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.paymentStatus === 'paid').length}
                </p>
                <p className="text-sm text-gray-600">Paid Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ৳{appointments.filter(apt => apt.paymentStatus === 'paid').reduce((total, apt) => total + apt.paymentAmount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Amount Paid</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 