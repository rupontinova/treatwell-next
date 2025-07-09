import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
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

export interface IReview extends mongoose.Document {
  patientName: string;
  patientId: mongoose.Types.ObjectId;
  rating: number;
  reviewMessage: string;
  createdAt: Date;
}

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema); 