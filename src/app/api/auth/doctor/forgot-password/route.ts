import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';
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

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });

    if (!doctor) {
      return NextResponse.json({ success: false, message: 'No doctor account found with that email address' }, { status: 404 });
    }

    // Generate 4-digit OTP
    const otpCode = doctor.generateOTP();
    await doctor.save({ validateBeforeSave: false });

    const transporter = createTransporter();

    const mailOptions = {
      from: `"TreatWell Support" <${process.env.EMAIL_USER}>`,
      to: doctor.email,
      subject: 'Doctor Password Reset OTP - TreatWell',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TreatWell</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Healthcare Platform - Doctor Portal</p>
            </div>
            <h2 style="color: #374151; margin-bottom: 20px;">Doctor Password Reset OTP</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>Dr. ${doctor.name}</strong>,
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your TreatWell doctor account. Please use the OTP code below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; border: 2px dashed #2563eb; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
                ${otpCode}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              <strong>Important:</strong> This OTP will expire in 15 minutes for security reasons.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from TreatWell Doctor Portal. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, message: 'OTP sent to your email successfully. Please check your inbox.' });
    } catch (error) {
      console.error('Email sending error:', error);
      doctor.otpCode = undefined;
      doctor.otpExpire = undefined;
      await doctor.save({ validateBeforeSave: false });
      return NextResponse.json({ success: false, message: `Email could not be sent. Please try again.` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Doctor forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 