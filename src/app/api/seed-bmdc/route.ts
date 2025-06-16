import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BmdcDoctor from '@/models/BmdcDoctor';

const doctors = [
    { name: 'Dr. Evelyn Reed', bmdc: '93481' },
    { name: 'Dr. Marcus Thorne', bmdc: '58204' },
    { name: 'Dr. Elena Vance', bmdc: '74152' },
    { name: 'Dr. Julian Croft', bmdc: '30967' },
    { name: 'Dr. Clara Monroe', bmdc: '65833' },
];

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Clear existing documents
    await BmdcDoctor.deleteMany({});
    
    // Insert the new documents
    await BmdcDoctor.insertMany(doctors);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully seeded the bmdcdoctors collection with 5 documents.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to seed database: ${error.message}`,
      },
      { status: 500 }
    );
  }
} 