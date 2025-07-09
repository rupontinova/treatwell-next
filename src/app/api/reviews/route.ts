import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/Review";
import Patient from "@/models/Patient";
import jwt from "jsonwebtoken";

// GET: Fetch random reviews
export async function GET() {
  try {
    await dbConnect();
    
    // Get random 3 reviews
    const reviews = await Review.aggregate([
      { $sample: { size: 3 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST: Submit a new review
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
    
    // Get patient details
    const patient = await Patient.findById(decoded.id);
    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }
    
    // Check if patient has already submitted a review
    const existingReview = await Review.findOne({ patientId: decoded.id });
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
    
    // Create new review
    const newReview = new Review({
      patientName: patient.fullName,
      patientId: decoded.id,
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
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
} 