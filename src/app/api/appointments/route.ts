import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const patientId = req.nextUrl.searchParams.get('patientId');
        const doctorId = req.nextUrl.searchParams.get('doctorId');

        let appointments;
        if (patientId) {
            appointments = await Appointment.find({ patientId });
        } else if (doctorId) {
            appointments = await Appointment.find({ doctorId });
        } else {
            return NextResponse.json({ success: true, data: [] });
        }
        
        return NextResponse.json({ success: true, data: appointments });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    
    try {
        const body = await req.json();
        const appointmentData = { ...body, appointmentId: uuidv4() };
        const newAppointment = await Appointment.create(appointmentData);
        return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
} 