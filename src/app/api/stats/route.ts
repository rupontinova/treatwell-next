import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AppointmentModel from '@/models/Appointment';
import DoctorModel from '@/models/Doctor';
import PatientModel from '@/models/Patient';

export async function GET() {
  try {
    await dbConnect();

    // Get total appointments
    const totalAppointments = await AppointmentModel.countDocuments();

    // Get total doctors 
    const totalDoctors = await DoctorModel.countDocuments();

    // Get total patients
    const totalPatients = await PatientModel.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        totalAppointments,
        totalDoctors,
        totalPatients
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 