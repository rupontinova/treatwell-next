import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  await dbConnect();

  try {
    const { newPassword } = await req.json();

    if (!newPassword) {
      return NextResponse.json({ success: false, message: 'Please provide a new password' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(params.token)
      .digest('hex');

    const patient = await Patient.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Invalid or expired password reset token' }, { status: 400 });
    }

    patient.password = newPassword;
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpire = undefined;
    await patient.save();

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 