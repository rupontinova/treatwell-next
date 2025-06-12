import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    let doctors = await Doctor.find({});

    if (doctors.length === 0) {
      // Add some mock doctors if the database is empty
      const mockDoctors = [
          { name: 'Dr. Sarah Johnson', speciality: 'Cardiology', isRegistered: true, location: 'New York, USA', designation: 'Senior Cardiologist', qualification: 'MD, FACC', about: 'Specialized in preventive cardiology and heart disease management.', phone: '+1234567890' },
          { name: 'Dr. Michael Chen', speciality: 'Neurology', isRegistered: true, location: 'San Francisco, USA', designation: 'Consultant Neurologist', qualification: 'MD, PhD', about: 'Expert in neurological disorders and brain health management.', phone: '+1987654321' },
          { name: 'Dr. Emily Rodriguez', speciality: 'Pediatrics', isRegistered: true, location: 'Miami, USA', designation: 'Pediatrician', qualification: 'MBBS, DCH', about: 'Dedicated to providing comprehensive care for children of all ages.', phone: '+1122334455' },
          { name: 'Dr. James Wilson', speciality: 'Orthopedics', isRegistered: false, location: 'Chicago, USA', designation: 'Orthopedic Surgeon', qualification: 'MS, FRCS', about: 'Specialized in sports injuries and joint replacement surgery.', phone: '+1556677889' },
      ];
      await Doctor.insertMany(mockDoctors);
      doctors = await Doctor.find({});
    }

    return NextResponse.json({ success: true, data: doctors });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 