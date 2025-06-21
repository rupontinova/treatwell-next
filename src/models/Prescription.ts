import mongoose, { Document, Model, Schema } from 'mongoose';

interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  _id: Schema.Types.ObjectId;
  prescriptionId: string;
  appointmentId: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  doctorId: Schema.Types.ObjectId;
  doctorName: string;
  doctorSpeciality: string;
  doctorQualification: string;
  doctorDesignation: string;
  diagnosis: string;
  chiefComplaint: string;
  medications: IMedication[];
  generalInstructions: string;
  nextVisitDate?: string;
  prescriptionDate: string;
  createdAt: Date;
}

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' }
});

const PrescriptionSchema: Schema<IPrescription> = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  doctorSpeciality: { type: String, required: true },
  doctorQualification: { type: String, required: true },
  doctorDesignation: { type: String, required: true },
  diagnosis: { type: String, required: true },
  chiefComplaint: { type: String, required: true },
  medications: [MedicationSchema],
  generalInstructions: { type: String, default: '' },
  nextVisitDate: { type: String, default: '' },
  prescriptionDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PrescriptionModel: Model<IPrescription> = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

export default PrescriptionModel; 