import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  gender: string;
  speciality: string;
  isRegistered: boolean;
  location: string;
  designation: string;
  qualification: string;
  about: string;
  phone: string;
  bmdcNumber: string;
  profilePicture?: string;
  createdAt: Date;
}

const DoctorSchema: Schema<IDoctor> = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  gender: { type: String, required: true },
  speciality: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  location: { type: String, required: true },
  designation: { type: String, required: true },
  qualification: { type: String, required: true },
  about: { type: String, required: true },
  phone: { type: String, required: true },
  bmdcNumber: { type: String, required: true, unique: true },
  profilePicture: { type: String, default: '/default-doctor.jpg' },
  createdAt: { type: Date, default: Date.now }
});

// Match password
DoctorSchema.methods.matchPassword = async function (enteredPassword: any) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const DoctorModel: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default DoctorModel; 