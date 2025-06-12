import mongoose, { Document, Model, Schema } from 'mongoose';

interface IHealthMetric {
  value: number;
  date: Date;
}

interface IBloodPressure {
  systolic: number;
  diastolic: number;
  date: Date;
}

export interface IHealthData extends Document {
  patientId: Schema.Types.ObjectId;
  bmiHistory: IHealthMetric[];
  bpHistory: IBloodPressure[];
}

const HealthMetricSchema: Schema<IHealthMetric> = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const BloodPressureSchema: Schema<IBloodPressure> = new mongoose.Schema({
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const HealthDataSchema: Schema<IHealthData> = new mongoose.Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
  bmiHistory: [HealthMetricSchema],
  bpHistory: [BloodPressureSchema],
});

const HealthDataModel: Model<IHealthData> = mongoose.models.HealthData || mongoose.model<IHealthData>('HealthData', HealthDataSchema);

export default HealthDataModel; 