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
  otpCode?: string;
  otpExpire?: Date;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  generateOTP(): string;
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
  profilePicture: { type: String, default: '/default-avatar.png' },
  otpCode: { type: String, default: null },
  otpExpire: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Match password
DoctorSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate 4-digit OTP code
DoctorSchema.methods.generateOTP = function (this: IDoctor): string {
  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Set OTP and expiry time (15 minutes)
  this.otpCode = otp;
  this.otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return otp;
};

const DoctorModel: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default DoctorModel; 