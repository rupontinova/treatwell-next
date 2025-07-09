import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const patient = await Patient.findById(decoded.id);

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const patient = await Patient.findById(decoded.id);

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    const body = await req.json();
    const { fullName, username, phone, address, gender, dob, nationalId } = body;

    // Update only the provided fields
    const updateData: Partial<{
      fullName: string;
      username: string;
      phone: string;
      address: string;
      gender: string;
      dob: Date;
      nationalId: string;
    }> = {};
    
    if (fullName !== undefined) updateData.fullName = fullName;
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone || 'not-provided';
    if (address !== undefined) updateData.address = address || 'not-provided';
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : patient.dob;
    if (nationalId !== undefined) updateData.nationalId = nationalId || patient.nationalId;

    // Check for duplicate username if username is being updated
    if (username && username !== patient.username) {
      const existingUser = await Patient.findOne({ username, _id: { $ne: decoded.id } });
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedPatient });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ success: false, message: 'Validation error: ' + error.message }, { status: 400 });
    }

    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 