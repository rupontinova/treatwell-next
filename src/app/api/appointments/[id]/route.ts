import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(params.id);

    if (!deletedAppointment) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !['pending', 'Done', 'Declined'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedAppointment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 