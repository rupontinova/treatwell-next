import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBmdcDoctor extends Document {
  name: string;
  bmdc: string;
}

const BmdcDoctorSchema: Schema<IBmdcDoctor> = new mongoose.Schema({
  name: { type: String, required: true },
  bmdc: { type: String, required: true, unique: true },
});

const BmdcDoctorModel: Model<IBmdcDoctor> = mongoose.models.BmdcDoctor || mongoose.model<IBmdcDoctor>('BmdcDoctor', BmdcDoctorSchema);

export default BmdcDoctorModel; 