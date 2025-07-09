import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Doctor from '@/models/Doctor';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const formData = await req.formData();
    
    const data: { [key: string]: any } = {};
    let file: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (key === 'profilePicture' && value instanceof File) {
        file = value;
      } else {
        data[key] = value;
      }
    }

    const {
      username,
      name,
      email,
      password,
      gender,
      phone,
      bmdcNumber,
      speciality,
      location,
      designation,
      qualification,
      about,
    } = data;
    
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { username }, { bmdcNumber }],
    });

    if (existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          message: 'Doctor already exists with this email, username, or BMDC number',
        },
        { status: 400 }
      );
    }

    let profilePicturePath = '/default-avatar.png'; // Default image
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${file.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'doctors');
      const imagePath = path.join(uploadDir, filename);

      // Ensure the upload directory exists
      await mkdir(uploadDir, { recursive: true });

      await writeFile(imagePath, buffer);
      profilePicturePath = `/uploads/doctors/${filename}`;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor
    const doctor = await Doctor.create({
      username,
      name,
      email,
      password: hashedPassword,
      gender,
      phone,
      bmdcNumber,
      speciality,
      location,
      designation,
      qualification,
      about,
      profilePicture: profilePicturePath,
      isRegistered: false, // Set to false, waiting for admin approval
    });
    
    return NextResponse.json(
      {
        success: true,
        message: "Doctor registration successful. Please wait for admin approval.",
        doctor: {
          id: doctor._id,
          username: (doctor as any).username,
          name: (doctor as any).name,
          email: (doctor as any).email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Doctor Registration Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred during registration.',
      },
      { status: 500 }
    );
  }
} 