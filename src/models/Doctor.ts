import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  speciality: string;
  isRegistered: boolean;
  location: string;
  designation: string;
  qualification: string;
  about: string;
  phone: string;
  profilePicture?: string;
}

const DoctorSchema: Schema<IDoctor> = new mongoose.Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  location: { type: String, required: true },
  designation: { type: String, required: true },
  qualification: { type: String, required: true },
  about: { type: String, required: true },
  phone: { type: String, required: true },
  profilePicture: { type: String, default: null },
});

const DoctorModel: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default DoctorModel; 