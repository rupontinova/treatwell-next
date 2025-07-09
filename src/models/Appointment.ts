import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: Schema.Types.ObjectId;
  appointmentId: string;
  appointmentTime: string;
  patientId: Schema.Types.ObjectId;
  patientName: string;
  doctorId: Schema.Types.ObjectId;
  doctorName: string;
  speciality: string;
  doctorInfo: string;
  location: string;
  designation: string;
  qualification: string;
  appointmentDate: string;
  appointmentDay: string;
  status: 'pending' | 'Done' | 'Declined';
  paymentStatus: 'paid' | 'unpaid';
  paymentAmount: number;
  paymentDate?: Date;
  meetingLink?: string;
  meetingTime?: string;
  meetingScheduled?: boolean;
  meetingEmailSent?: boolean;
}

const AppointmentSchema: Schema<IAppointment> = new mongoose.Schema({
    appointmentId: { type: String, required: true, unique: true },
    appointmentTime: { type: String, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },
    speciality: { type: String, required: true },
    doctorInfo: { type: String, required: true },
    location: { type: String, required: true },
    designation: { type: String, required: true },
    qualification: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentDay: { type: String, required: true },
    status: { type: String, enum: ['pending', 'Done', 'Declined'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paymentAmount: { type: Number, default: 0 }, // Default consultation fee
    paymentDate: { type: Date },
    meetingLink: { type: String, default: '' },
    meetingTime: { type: String, default: '' },
    meetingScheduled: { type: Boolean, default: false },
    meetingEmailSent: { type: Boolean, default: false },
});

const AppointmentModel: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default AppointmentModel; 