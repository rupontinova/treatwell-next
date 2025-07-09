import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";

interface DecodedToken {
  id: string;
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const mimeType = file.type;
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Update user's profile picture in the database
    await Patient.findByIdAndUpdate(decoded.id, { profilePicture: dataUrl });

    return NextResponse.json({ success: true, filePath: dataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided' || error.name === 'JsonWebTokenError')) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Image upload failed" }, { status: 500 });
  }
} 