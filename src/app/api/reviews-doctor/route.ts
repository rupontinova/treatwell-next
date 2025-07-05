import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ReviewDoctor from "@/models/ReviewDoctor";
import Doctor from "@/models/Doctor";
import jwt from "jsonwebtoken";

// GET: Fetch random doctor reviews
export async function GET() {
  try {
    await dbConnect();
    
    // Get random 3 doctor reviews
    const reviews = await ReviewDoctor.aggregate([
      { $sample: { size: 3 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching doctor reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctor reviews" },
      { status: 500 }
    );
  }
}

// POST: Submit a new doctor review
export async function POST(request: NextRequest) {
  try {
    const { rating, reviewMessage } = await request.json();
    
    // Get token from header
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Login required to submit a review" },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    await dbConnect();
    
    // Get doctor details
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }
    
    // Check if doctor has already submitted a review
    const existingReview = await ReviewDoctor.findOne({ doctorId: decoded.id });
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already submitted a review" },
        { status: 400 }
      );
    }
    
    // Validate input
    if (!rating || !reviewMessage) {
      return NextResponse.json(
        { success: false, message: "Rating and review message are required" },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    
    if (reviewMessage.length > 500) {
      return NextResponse.json(
        { success: false, message: "Review message must be less than 500 characters" },
        { status: 400 }
      );
    }
    
    // Create new doctor review
    const newReview = new ReviewDoctor({
      doctorName: doctor.name,
      doctorId: decoded.id,
      rating,
      reviewMessage
    });
    
    await newReview.save();
    
    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: newReview
    });
    
  } catch (error) {
    console.error("Error submitting doctor review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit doctor review" },
      { status: 500 }
    );
  }
} 