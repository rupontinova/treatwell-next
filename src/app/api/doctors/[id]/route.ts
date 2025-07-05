import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const doctor = await Doctor.findById(params.id);

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: doctor });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, username, phone, gender, speciality, location, designation, qualification, about } = body;

    const doctor = await Doctor.findById(params.id);

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Doctor not found' }, { status: 404 });
    }

    // Update doctor information
    doctor.name = name || doctor.name;
    doctor.username = username || doctor.username;
    doctor.phone = phone || doctor.phone;
    doctor.gender = gender || doctor.gender;
    doctor.speciality = speciality || doctor.speciality;
    doctor.location = location || doctor.location;
    doctor.designation = designation || doctor.designation;
    doctor.qualification = qualification || doctor.qualification;
    doctor.about = about || doctor.about;

    await doctor.save();

    return NextResponse.json({ success: true, data: doctor });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 