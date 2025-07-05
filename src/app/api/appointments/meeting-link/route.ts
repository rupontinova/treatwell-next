import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { appointmentId, meetingTime, meetingLink } = await req.json();

    if (!appointmentId || !meetingTime || !meetingLink) {
      return NextResponse.json({
        success: false,
        message: 'Appointment ID, meeting time, and meeting link are required'
      }, { status: 400 });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    // Find the patient to get email
    const patient = await Patient.findById(appointment.patientId);
    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'Patient not found'
      }, { status: 404 });
    }

    // Update appointment with meeting details
    appointment.meetingLink = meetingLink;
    appointment.meetingTime = meetingTime;
    appointment.meetingScheduled = true;
    appointment.meetingEmailSent = false; // Will be set to true after email is sent

    await appointment.save();

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email template
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: `Meeting Scheduled - Dr. ${appointment.doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">TreatWell</h1>
            <h2 style="color: #374151; margin-bottom: 20px;">Meeting Scheduled</h2>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Meeting Details</h3>
            <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
            <p><strong>Speciality:</strong> ${appointment.speciality}</p>
            <p><strong>Patient:</strong> ${appointment.patientName}</p>
            <p><strong>Appointment Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Meeting Time:</strong> ${meetingTime}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">Join the Meeting</h3>
            <p style="margin-bottom: 15px;">Dr. ${appointment.doctorName} has scheduled a meeting with you.</p>
            <div style="text-align: center;">
              <a href="${meetingLink}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Meeting</a>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Note:</strong> Please join the meeting at the scheduled time. Make sure you have a stable internet connection.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This email was sent by TreatWell Healthcare Platform<br>
              If you have any questions, please contact us.
            </p>
          </div>
        </div>
      `,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      
      // Update appointment to mark email as sent
      appointment.meetingEmailSent = true;
      await appointment.save();

      return NextResponse.json({
        success: true,
        message: 'Meeting link sent successfully',
        data: {
          appointmentId,
          meetingTime,
          meetingLink,
          patientEmail: patient.email
        }
      });
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      
      // Still return success since meeting was scheduled, but note email failed
      return NextResponse.json({
        success: true,
        message: 'Meeting scheduled but email failed to send',
        emailError: emailError.message
      });
    }

  } catch (error: any) {
    console.error('Meeting link API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to send meeting link'
    }, { status: 500 });
  }
} 