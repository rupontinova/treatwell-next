import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface DecodedToken {
  id: string;
  role: string;
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    if (!decoded || decoded.role !== 'doctor') {
      return NextResponse.json({ message: "Invalid token or unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File size too large (max 5MB)" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: "Only image files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'doctors');
    const imagePath = path.join(uploadDir, filename);

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    await writeFile(imagePath, buffer);
    const profilePicturePath = `/uploads/doctors/${filename}`;

    // Update doctor's profile picture in the database
    await Doctor.findByIdAndUpdate(decoded.id, { profilePicture: profilePicturePath });

    return NextResponse.json({ success: true, filePath: profilePicturePath });
  } catch (error) {
    console.error("Doctor upload error:", error);
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided' || error.name === 'JsonWebTokenError')) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Image upload failed" }, { status: 500 });
  }
} 