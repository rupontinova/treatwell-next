import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Get all unique specialities from the Doctor collection
    const specialities = await Doctor.distinct('speciality');
    
    // Filter out any null or empty values, make case-insensitive distinct, and sort alphabetically
    const filteredSpecialities = specialities
      .filter(spec => spec && spec.trim() !== '')
      .map(spec => spec.trim());

    // Create case-insensitive distinct array
    const distinctSpecialities: string[] = [];
    const lowerCaseTracker = new Set<string>();

    filteredSpecialities.forEach(spec => {
      const lowerCase = spec.toLowerCase();
      if (!lowerCaseTracker.has(lowerCase)) {
        lowerCaseTracker.add(lowerCase);
        // Use proper case (first letter uppercase, rest lowercase)
        const properCase = spec.charAt(0).toUpperCase() + spec.slice(1).toLowerCase();
        distinctSpecialities.push(properCase);
      }
    });

    // Sort alphabetically
    distinctSpecialities.sort();

    return NextResponse.json({ 
      success: true, 
      data: distinctSpecialities 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
} 