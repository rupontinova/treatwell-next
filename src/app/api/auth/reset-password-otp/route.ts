import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'Please provide email, OTP code, and new password' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const patient = await Patient.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Reset password and clear OTP fields
    patient.password = newPassword;
    patient.otpCode = undefined;
    patient.otpExpire = undefined;
    await patient.save();

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 