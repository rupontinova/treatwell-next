import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import HealthData from '@/models/HealthData';
import Patient from '@/models/Patient';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
}

// Function to get patientId from token
const getPatientId = (req: NextRequest): string | null => {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const patientId = getPatientId(req);
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let healthData = await HealthData.findOne({ patientId });

    if (!healthData) {
      healthData = await HealthData.create({ patientId, bmiHistory: [], bpHistory: [] });
    }

    return NextResponse.json({ success: true, data: healthData });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const patientId = getPatientId(req);
    if (!patientId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, data } = body;

    let healthData = await HealthData.findOne({ patientId });
    if (!healthData) {
      healthData = await HealthData.create({ patientId, bmiHistory: [], bpHistory: [] });
    }

    if (type === 'bmi' && data.value) {
      healthData.bmiHistory.push({ value: data.value, date: new Date() });
    } else if (type === 'bp' && data.systolic && data.diastolic) {
      healthData.bpHistory.push({ systolic: data.systolic, diastolic: data.diastolic, date: new Date() });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid data provided' }, { status: 400 });
    }

    await healthData.save();

    return NextResponse.json({ success: true, data: healthData });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 