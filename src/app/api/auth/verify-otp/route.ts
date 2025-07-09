import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Please provide email and OTP code' }, { status: 400 });
    }

    const patient = await Patient.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP code' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      patientId: patient._id 
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 