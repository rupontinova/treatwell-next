import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Google authentication was cancelled')}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('No authorization code received')}`, req.url)
      );
    }

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Unable to get user email from Google')}`, req.url)
      );
    }

    // Check if user already exists with this email
    const existingPatient = await Patient.findOne({ email: data.email });

    if (existingPatient) {
      // Check if this user was registered via Google or regular registration
      if (existingPatient.googleId) {
        // User registered via Google, allow login
        const token = existingPatient.getSignedJwtToken();
        
        // Redirect to home with token
        const redirectUrl = new URL('/', req.url);
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('user', JSON.stringify({
          id: existingPatient._id,
          username: existingPatient.username,
          fullName: existingPatient.fullName,
          email: existingPatient.email,
        }));
        
        return NextResponse.redirect(redirectUrl);
      } else {
        // User registered via normal registration
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('This email is already registered. Please use your regular login credentials.')}`, req.url)
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

    // Redirect to home with token
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: patient._id,
      username: patient.username,
      fullName: patient.fullName,
      email: patient.email,
    }));
    redirectUrl.searchParams.set('welcome', 'true');

    return NextResponse.redirect(redirectUrl);

  } catch (error: unknown) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Google authentication failed')}`, req.url)
    );
  }
} 