import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Prescription from '@/models/Prescription';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const appointmentId = req.nextUrl.searchParams.get('appointmentId');
    const prescriptionId = req.nextUrl.searchParams.get('prescriptionId');

    let prescription;
    if (appointmentId) {
      prescription = await Prescription.findOne({ appointmentId });
    } else if (prescriptionId) {
      prescription = await Prescription.findOne({ prescriptionId });
    } else {
      return NextResponse.json({ success: false, message: 'appointmentId or prescriptionId is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: prescription });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const prescriptionData = { 
      ...body, 
      prescriptionId: `RX-${uuidv4().slice(0, 8).toUpperCase()}`,
      prescriptionDate: new Date().toLocaleDateString('en-GB') // DD/MM/YYYY format
    };
    
    const newPrescription = await Prescription.create(prescriptionData);
    return NextResponse.json({ success: true, data: newPrescription }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
} 