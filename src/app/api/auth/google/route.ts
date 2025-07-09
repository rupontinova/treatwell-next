import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return NextResponse.json(
        { success: false, message: 'Unable to get user email from Google' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email
    const existingPatient = await Patient.findOne({ email: data.email });

    if (existingPatient) {
      // Check if this user was registered via Google or regular registration
      if (existingPatient.googleId) {
        // User registered via Google, allow login
        const token = existingPatient.getSignedJwtToken();
        
        return NextResponse.json({
          success: true,
          token,
          patient: {
            id: existingPatient._id,
            username: existingPatient.username,
            fullName: existingPatient.fullName,
            email: existingPatient.email,
          },
        });
      } else {
        // User registered via normal registration
        return NextResponse.json(
          { success: false, message: 'This email is already registered. Please use your regular login credentials.' },
          { status: 409 }
        );
      }
    }

    // Create new user with Google account
    const patient = await Patient.create({
      username: data.email?.split('@')[0] || data.id,
      fullName: data.name || 'Google User',
      email: data.email,
      googleId: data.id,
      profilePicture: data.picture,
      isEmailVerified: true,
      // Set dummy values for required fields
      gender: 'not-specified',
      dob: new Date(),
      nationalId: `google-${data.id}`,
      phone: 'not-provided',
      address: 'not-provided',
    });

    const token = patient.getSignedJwtToken();

    return NextResponse.json({
      success: true,
      token,
      patient: {
        id: patient._id,
        username: patient.username,
        fullName: patient.fullName,
        email: patient.email,
      },
    });

  } catch (error: unknown) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { success: false, message: 'Google authentication failed' },
      { status: 500 }
    );
  }
} 