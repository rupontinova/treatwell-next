import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';
import bcrypt from 'bcryptjs';

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

    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Reset password and clear OTP fields
    doctor.password = hashedPassword;
    doctor.otpCode = undefined;
    doctor.otpExpire = undefined;
    await doctor.save({ validateBeforeSave: false });

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Doctor reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 