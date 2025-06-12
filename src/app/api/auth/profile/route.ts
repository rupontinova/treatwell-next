import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Patient from '@/models/Patient';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const patient = await Patient.findById(decoded.id);

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 