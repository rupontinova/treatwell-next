'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IPrescription } from '@/models/Prescription';
import { Calendar, Clock, User, Phone, FileText, ArrowLeft, Download, Pill } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ViewPrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const [prescription, setPrescription] = useState<IPrescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/prescriptions?appointmentId=${appointmentId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch prescription');
        }
        
        const data = await res.json();
        if (!data.data) {
          throw new Error('Prescription not found');
        }
        
        setPrescription(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [appointmentId, router]);

  const handleDownloadPDF = async () => {
    if (!prescription) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Simple test first
      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235); // Blue color
      pdf.text('Medical Prescription', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // Gray color
      pdf.text('TreatWell Healthcare Platform', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFont('helvetica', 'normal');
      
      // Prescription Info Box
      pdf.setFillColor(219, 234, 254); // Light blue background
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 15, 'F');
      yPos += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Prescription ID: ${prescription.prescriptionId}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Date: ${prescription.prescriptionDate}`, margin + 5, yPos);
      yPos += 15;

      // Doctor Information
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('Doctor Information', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Name: ${prescription.doctorName}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Speciality: ${prescription.doctorSpeciality}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Qualification: ${prescription.doctorQualification}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Designation: ${prescription.doctorDesignation}`, margin + 5, yPos);
      yPos += 10;

      // Patient Information
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 163, 74); // Green color
      pdf.text('Patient Information', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Name: ${prescription.patientName}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Age: ${prescription.patientAge} years`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Gender: ${prescription.patientGender}`, margin + 5, yPos);
      yPos += 5;
      pdf.text(`Phone: ${prescription.patientPhone}`, margin + 5, yPos);
      yPos += 10;

      // Chief Complaint
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Chief Complaint', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const complaintLines = pdf.splitTextToSize(prescription.chiefComplaint, pageWidth - (margin * 2));
      pdf.text(complaintLines, margin + 5, yPos);
      yPos += complaintLines.length * 5 + 5;

      // Diagnosis
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Diagnosis', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const diagnosisLines = pdf.splitTextToSize(prescription.diagnosis, pageWidth - (margin * 2));
      pdf.text(diagnosisLines, margin + 5, yPos);
      yPos += diagnosisLines.length * 5 + 5;

      // Medications
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prescribed Medications', margin, yPos);
      yPos += 8;

      prescription.medications.forEach((medication, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          pdf.addPage();
          yPos = margin;
        }
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${medication.name}`, margin + 5, yPos);
        yPos += 5;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`   Dosage: ${medication.dosage}`, margin + 5, yPos);
        yPos += 4;
        pdf.text(`   Frequency: ${medication.frequency}`, margin + 5, yPos);
        yPos += 4;
        pdf.text(`   Duration: ${medication.duration}`, margin + 5, yPos);
        yPos += 4;
        
        if (medication.instructions) {
          pdf.text(`   Instructions: ${medication.instructions}`, margin + 5, yPos);
          yPos += 4;
        }
        yPos += 3;
      });

      // General Instructions
      if (prescription.generalInstructions) {
        if (yPos > 250) {
          pdf.addPage();
          yPos = margin;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('General Instructions', margin, yPos);
        yPos += 6;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const instructionLines = pdf.splitTextToSize(prescription.generalInstructions, pageWidth - (margin * 2));
        pdf.text(instructionLines, margin + 5, yPos);
        yPos += instructionLines.length * 5 + 5;
      }

      // Next Visit
      if (prescription.nextVisitDate) {
        if (yPos > 260) {
          pdf.addPage();
          yPos = margin;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6); // Yellow color
        pdf.text('Next Visit', margin, yPos);
        yPos += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(new Date(prescription.nextVisitDate).toLocaleDateString('en-GB'), margin + 5, yPos);
      }

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('This prescription is generated electronically and is valid without signature.', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('For any queries, please contact TreatWell Healthcare Platform.', pageWidth / 2, footerY + 4, { align: 'center' });
      pdf.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, pageWidth / 2, footerY + 8, { align: 'center' });

      const fileName = `Prescription_${prescription.prescriptionId}_${prescription.patientName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Prescription Not Available</h3>
          <p className="text-red-500 mb-4">{error || 'Prescription not found'}</p>
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
        <div className="text-3xl font-bold text-blue-600">TreatWell</div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors ${
              isGeneratingPDF 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prescription Header */}
        <div ref={prescriptionRef} className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Medical Prescription</h1>
            <p className="text-gray-600 text-lg">TreatWell Healthcare Platform</p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
              <p className="text-blue-800 font-semibold">Prescription ID: {prescription.prescriptionId}</p>
              <p className="text-blue-600 text-sm">Date: {prescription.prescriptionDate}</p>
            </div>
          </div>

          {/* Doctor & Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Doctor Information
              </h3>
                             <div className="space-y-2 text-sm">
                 <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-800 font-medium">{prescription.doctorName}</span></p>
                 <p><span className="font-semibold text-gray-700">Speciality:</span> <span className="text-gray-800 font-medium">{prescription.doctorSpeciality}</span></p>
                 <p><span className="font-semibold text-gray-700">Qualification:</span> <span className="text-gray-800 font-medium">{prescription.doctorQualification}</span></p>
                 <p><span className="font-semibold text-gray-700">Designation:</span> <span className="text-gray-800 font-medium">{prescription.doctorDesignation}</span></p>
               </div>
            </div>

            {/* Patient Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h3>
                             <div className="space-y-2 text-sm">
                 <p><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-800 font-medium">{prescription.patientName}</span></p>
                 <p><span className="font-semibold text-gray-700">Age:</span> <span className="text-gray-800 font-medium">{prescription.patientAge} years</span></p>
                 <p><span className="font-semibold text-gray-700">Gender:</span> <span className="text-gray-800 font-medium">{prescription.patientGender}</span></p>
                 <p><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-800 font-medium">{prescription.patientPhone}</span></p>
               </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-6">
            {/* Chief Complaint */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Chief Complaint</h3>
                             <p className="text-gray-800 leading-relaxed">{prescription.chiefComplaint}</p>
            </div>

            {/* Diagnosis */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Diagnosis</h3>
                             <p className="text-gray-800 leading-relaxed">{prescription.diagnosis}</p>
            </div>

            {/* Medications */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Prescribed Medications
              </h3>
              <div className="space-y-4">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Medicine</p>
                        <p className="text-gray-800 font-semibold text-lg">{medication.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dosage</p>
                                                 <p className="text-gray-800 font-medium">{medication.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Frequency</p>
                                                 <p className="text-gray-800 font-medium">{medication.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</p>
                                                 <p className="text-gray-800 font-medium">{medication.duration}</p>
                      </div>
                    </div>
                    {medication.instructions && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Instructions</p>
                                                 <p className="text-gray-800 text-sm italic">{medication.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* General Instructions */}
            {prescription.generalInstructions && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">General Instructions</h3>
                                 <p className="text-gray-800 leading-relaxed whitespace-pre-line">{prescription.generalInstructions}</p>
              </div>
            )}

            {/* Next Visit */}
            {prescription.nextVisitDate && (
              <div className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                <h3 className="text-lg font-bold text-yellow-800 mb-3 border-b border-yellow-200 pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Next Visit
                </h3>
                <p className="text-yellow-800 font-semibold">{new Date(prescription.nextVisitDate).toLocaleDateString('en-GB')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This prescription is generated electronically and is valid without signature.</p>
            <p className="mt-1">For any queries, please contact TreatWell Healthcare Platform.</p>
            <p className="mt-2 font-semibold">Generated on: {new Date().toLocaleString('en-GB')}</p>
          </div>
        </div>
      </main>


    </div>
  );
} 