'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, User, Phone, MapPin, Briefcase, GraduationCap, ArrowLeft, Download, CreditCard, CheckCircle } from 'lucide-react';
import { IAppointment } from '@/models/Appointment';
import jsPDF from 'jspdf';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('1000');
  
  // Recommended fee is always 1000
  const RECOMMENDED_FEE = 1000;

  useEffect(() => {
    const fetchAppointment = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch appointment');
        }
        
        const data = await res.json();
        if (!data.success || !data.data) {
          throw new Error('Appointment not found');
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

  const handlePayment = async () => {
    if (!appointment) return;
    
    const amount = parseFloat(paymentAmount);
    
    // Validate that amount is exactly 1000
    if (amount !== RECOMMENDED_FEE) {
      alert(`Only the recommended fee of ৳${RECOMMENDED_FEE} is allowed. You cannot pay more or less than this amount.`);
      return;
    }
    
    setProcessing(true);
    
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentAmount: RECOMMENDED_FEE
        }),
      });

      if (!res.ok) {
        throw new Error('Payment failed');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error('Payment update failed');
      }
      
      setAppointment(data.data);
      setShowSuccess(true);
      
      // Redirect to appointments after 3 seconds
      setTimeout(() => {
        router.push('/appointments');
      }, 3000);
      
    } catch (error: any) {
      alert(`Payment failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadInvoice = () => {
    if (!appointment) return;
    
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
    pdf.text(`Payment Date: ${appointment.paymentDate ? new Date(appointment.paymentDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}`, margin, yPos);
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
    pdf.text(`Consultation Fee: ৳${appointment.paymentAmount || 1000}`, margin + 5, yPos);
    yPos += 5;
    pdf.text(`Total Amount: ৳${appointment.paymentAmount || 1000}`, margin + 5, yPos);
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
            onClick={() => router.push('/appointments')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-2">Your payment of ৳{RECOMMENDED_FEE} has been processed successfully.</p>
          <p className="text-sm text-green-600 mb-4">
            Payment Date: {new Date().toLocaleDateString('en-GB')}
          </p>
          <p className="text-sm text-gray-500 mb-4">Redirecting to appointments in 3 seconds...</p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Appointments Now
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
        <div className="text-3xl font-bold text-blue-600">TreatWell</div>
        <div className="flex items-center gap-3">
          {/* Download Invoice button removed */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-lg text-gray-600">Complete your consultation fee payment</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Payment Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              appointment.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {appointment.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
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

            {/* Patient Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
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
          </div>

          {/* Payment Details */}
          <div className="border-2 border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommended Consultation Fee:</span>
                <span className="text-lg font-semibold text-green-600">৳{RECOMMENDED_FEE}</span>
              </div>
              
              {appointment.paymentStatus === 'unpaid' && (
                <div className="border-t pt-4">
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Payment Amount (৳)
                  </label>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold text-gray-900 placeholder:text-gray-600"
                    placeholder="Enter amount to pay"
                    min="1"
                  />
                  <p className="text-sm text-red-500 mt-2">⚠️ Only the recommended fee of ৳{RECOMMENDED_FEE} is allowed. You cannot pay more or less.</p>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{appointment.paymentStatus === 'paid' ? (appointment.paymentAmount || RECOMMENDED_FEE) : (paymentAmount || '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action */}
          {appointment.paymentStatus === 'unpaid' ? (
            <div className="text-center">
              <button
                onClick={handlePayment}
                disabled={processing || !paymentAmount || parseFloat(paymentAmount) !== RECOMMENDED_FEE}
                className={`px-8 py-4 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 mx-auto ${
                  processing || !paymentAmount || parseFloat(paymentAmount) !== RECOMMENDED_FEE
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {processing ? 'Processing Payment...' : `Pay ৳${RECOMMENDED_FEE}`}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Secure payment processing • Only recommended fee accepted
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <h4 className="text-lg font-semibold text-green-800 mb-2">Payment Complete</h4>
                <p className="text-green-600 mb-2">
                  Payment of ৳{appointment.paymentAmount || RECOMMENDED_FEE} was successfully processed
                </p>
                <p className="text-sm text-green-500">
                  Payment Date: {appointment.paymentDate ? new Date(appointment.paymentDate).toLocaleDateString('en-GB') : 'N/A'}
                </p>
              </div>
              
              {/* Action Buttons after Payment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={downloadInvoice}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
                
                <button
                  onClick={() => router.push('/payment-history')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  View Payment History
                </button>
                
                <button
                  onClick={() => router.push('/appointments')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a1 1 0 01-1-1V8a1 1 0 011-1h3z"></path>
                  </svg>
                  Back to Appointments
                </button>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {showSuccess && appointment.paymentStatus === 'paid' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 