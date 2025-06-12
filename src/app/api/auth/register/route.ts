import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const {
      username,
      fullName,
      email,
      password,
      gender,
      dob,
      nationalId,
      phone,
      address,
    } = body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { username }, { nationalId }],
    });

    if (existingPatient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Patient already exists with this email, username, or national ID',
        },
        { status: 400 }
      );
    }

    // Create patient
    const patient = await Patient.create({
      username,
      fullName,
      email,
      password,
      gender,
      dob,
      nationalId,
      phone,
      address,
    });

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
      { status: 201 }
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