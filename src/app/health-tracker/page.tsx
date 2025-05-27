'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for graphs
const mockBMIData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'BMI History',
      data: [22.5, 22.8, 23.1, 22.9, 23.2, 23.0],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }
  ]
};

const mockBPData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Systolic',
      data: [120, 118, 122, 119, 121, 120],
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    },
    {
      label: 'Diastolic',
      data: [80, 78, 82, 79, 81, 80],
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1
    }
  ]
};

export default function HealthTrackerPage() {
  const router = useRouter();
  
  // BMI States
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [bmi, setBMI] = useState<number | null>(null);
  const [bmiCategory, setBMICategory] = useState('');

  // BP States
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bpCategory, setBPCategory] = useState('');

  // Calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters = parseFloat(height);
    let weightInKg = parseFloat(weight);

    // Convert units if necessary
    if (heightUnit === 'cm') heightInMeters /= 100;
    if (heightUnit === 'inches') heightInMeters *= 0.0254;
    if (weightUnit === 'pounds') weightInKg *= 0.453592;

    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    setBMI(parseFloat(bmiValue.toFixed(1)));

    // Set BMI category
    if (bmiValue < 18.5) setBMICategory('Underweight');
    else if (bmiValue < 25) setBMICategory('Normal');
    else if (bmiValue < 30) setBMICategory('Overweight');
    else setBMICategory('Obese');
  };

  // Calculate BP Category
  const calculateBP = () => {
    if (!systolic || !diastolic) return;

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (sys < 90 || dia < 60) setBPCategory('Hypotension (Low BP)');
    else if (sys >= 140 || dia >= 90) setBPCategory('Hypertension (High BP)');
    else if (sys >= 120 || dia >= 80) setBPCategory('Pre-Hypertension');
    else setBPCategory('Normal BP');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md sticky top-0 z-10">
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          TreatWell
        </div>
        <Link
          href="/"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Back to Home
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Health Tracker</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BMI Calculator Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">BMI Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter height"
                  />
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value)}
                    className="px-4 py-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="inches">inches</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 px-4 py-2 border  rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter weight"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="px-4 py-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="kg">kg</option>
                    <option value="pounds">pounds</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculateBMI}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Calculate BMI
              </button>

              {bmi && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-lg font-medium">Your BMI: {bmi}</p>
                  <p className="text-gray-600">Category: {bmiCategory}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Healthy BMI Range: 18.5 - 24.9
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg text-gray-600 font-medium mb-2">BMI History</h3>
                <div className="h-64">
                  <Line data={mockBMIData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>

          {/* BP Calculator Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Blood Pressure Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Systolic Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-4 py-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter systolic pressure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diastolic Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-4 py-2 border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter diastolic pressure"
                />
              </div>

              <button
                onClick={calculateBP}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Calculate BP
              </button>

              {bpCategory && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-lg font-medium">BP Category: {bpCategory}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {bpCategory === 'Normal BP' && 'Your blood pressure is within the normal range. Keep maintaining a healthy lifestyle!'}
                    {bpCategory === 'Hypotension (Low BP)' && 'Your blood pressure is low. Consider consulting a doctor if you experience symptoms.'}
                    {bpCategory === 'Pre-Hypertension' && 'Your blood pressure is slightly elevated. Consider lifestyle changes to prevent hypertension.'}
                    {bpCategory === 'Hypertension (High BP)' && 'Your blood pressure is high. Please consult a doctor for proper management.'}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg text-gray-600 font-medium mb-2">BP History</h3>
                <div className="h-64">
                  <Line data={mockBPData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 