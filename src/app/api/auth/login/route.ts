import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { username, password } = body;

    // Validate username & password
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide username and password',
        },
        { status: 400 }
      );
    }

    // Check for patient
    const patient = await Patient.findOne({ username }).select('+password');

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if password matches
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    const token = patient.getSignedJwtToken();

    return NextResponse.json(
      {
        success: true,
        token,
        patient: {
          id: patient._id,
          username: patient.username,
          fullName: patient.fullName,
          email: patient.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
} 