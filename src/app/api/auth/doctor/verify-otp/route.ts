import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Please provide email and OTP code' }, { status: 400 });
    }

    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP code' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully. You can now reset your password.' });
  } catch (error: any) {
    console.error('Doctor verify OTP error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 