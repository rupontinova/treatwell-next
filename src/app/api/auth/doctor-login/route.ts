import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor, { IDoctor } from '@/models/Doctor';
import BmdcDoctor from '@/models/BmdcDoctor';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { action, username, password, bmdcNumber } = body;

    // Find doctor by username for both actions
    const doctor = (await Doctor.findOne({ username }).select('+password')) as (IDoctor & { matchPassword: (password: string) => Promise<boolean> }) | null;

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (action === 'validate') {
      if (!password) {
        return NextResponse.json({ success: false, message: 'Password is required for validation' }, { status: 400 });
      }
      
      const isMatch = await doctor.matchPassword(password);

      if (!isMatch) {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }

      return NextResponse.json({ success: true, message: 'Validation successful. Please provide BMDC number.' });
    
    } else if (action === 'login') {
      if (!bmdcNumber) {
        return NextResponse.json({ success: false, message: 'BMDC number is required for login' }, { status: 400 });
      }

      // 1. Check if the provided BMDC number matches the one stored for the doctor
      if (doctor.bmdcNumber !== bmdcNumber) {
        return NextResponse.json({ success: false, message: 'BMDC number does not match.' }, { status: 403 });
      }

      // 2. Check against the BmdcDoctor collection
      const bmdcDoctor = await BmdcDoctor.findOne({
        name: doctor.name,
        bmdc: doctor.bmdcNumber,
      });

      if (!bmdcDoctor) {
        return NextResponse.json({ success: false, message: 'BMDC verification failed. Please contact admin.' }, { status: 403 });
      }
      
      // Update isRegistered flag to true
      if (!doctor.isRegistered) {
        doctor.isRegistered = true;
        await (doctor as any).save();
      }

      // Create and send token
      const payload = { id: doctor._id, role: 'doctor' };
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      const response = NextResponse.json({ success: true, message: 'Logged in successfully', token, doctor: { name: doctor.name } }, { status: 200 });
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      });

      return response;

    } else {
      return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Doctor Login Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An error occurred.' }, { status: 500 });
  }
} 