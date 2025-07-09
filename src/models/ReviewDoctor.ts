import mongoose from "mongoose";

const ReviewDoctorSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewMessage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export interface IReviewDoctor extends mongoose.Document {
  doctorName: string;
  doctorId: mongoose.Types.ObjectId;
  rating: number;
  reviewMessage: string;
  createdAt: Date;
}

export default mongoose.models.ReviewDoctor || mongoose.model<IReviewDoctor>("ReviewDoctor", ReviewDoctorSchema); 