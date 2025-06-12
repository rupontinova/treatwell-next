import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';
import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Please provide an email address' }, { status: 400 });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'No account found with that email address' }, { status: 404 });
    }

    const resetToken = patient.getResetPasswordToken();
    await patient.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"TreatWell Support" <${process.env.EMAIL_USER}>`,
      to: patient.email,
      subject: 'Password Reset Request - TreatWell',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TreatWell</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Healthcare Platform</p>
            </div>
            <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>${patient.fullName}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your TreatWell account. If you made this request, please click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from TreatWell. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: 'Password reset email sent successfully' });
    } catch (error: unknown) {
      console.error('Email sending error:', error);
      patient.resetPasswordToken = undefined;
      patient.resetPasswordExpire = undefined;
      await patient.save({ validateBeforeSave: false });
      return NextResponse.json({ success: false, message: `Email could not be sent. Please try again.` }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 