import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IPatient extends Document {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  otpCode?: string;
  otpExpire?: Date;
  isEmailVerified?: boolean;
  gender: 'Male' | 'Female' | 'Other' | 'not-specified';
  dob: Date;
  nationalId: string;
  phone: string;
  address: string;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
  generateOTP(): string;
}

const PatientSchema: Schema<IPatient> = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: function (this: IPatient) {
      return !this.googleId; // Password required only if no Google ID
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  profilePicture: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpire: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    required: [true, 'Please specify your gender'],
    enum: ['Male', 'Female', 'Other', 'not-specified'],
  },
  dob: {
    type: Date,
    required: [true, 'Please provide your date of birth'],
  },
  nationalId: {
    type: String,
    required: [true, 'Please provide your national ID'],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
  },
  address: {
    type: String,
    required: [true, 'Please provide your address'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
PatientSchema.pre<IPatient>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
PatientSchema.methods.getSignedJwtToken = function (this: IPatient): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: this._id }, secret, {
    expiresIn: '30d', // Default to 30 days if JWT_EXPIRE is not set
  });
};

// Match user entered password to hashed password in database
PatientSchema.methods.matchPassword = async function (this: IPatient, enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
PatientSchema.methods.getResetPasswordToken = function (this: IPatient): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return resetToken;
};

// Generate 4-digit OTP code
PatientSchema.methods.generateOTP = function (this: IPatient): string {
  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Set OTP and expiry time (15 minutes)
  this.otpCode = otp;
  this.otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return otp;
};

const PatientModel: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default PatientModel; 