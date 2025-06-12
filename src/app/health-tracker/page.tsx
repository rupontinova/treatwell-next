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
import { IHealthData } from '@/models/HealthData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HealthTrackerPage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<IHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/health-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch health data');
        }

        setHealthData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load health data');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [router]);

  const saveData = async (type: 'bmi' | 'bp', data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/health-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, data })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save data');
      }
      setHealthData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save health data');
    }
  };
  
  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters = parseFloat(height);
    let weightInKg = parseFloat(weight);

    if (heightUnit === 'cm') heightInMeters /= 100;
    if (heightUnit === 'inches') heightInMeters *= 0.0254;
    if (weightUnit === 'pounds') weightInKg *= 0.453592;

    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    const roundedBmi = parseFloat(bmiValue.toFixed(1));
    setBMI(roundedBmi);

    if (bmiValue < 18.5) setBMICategory('Underweight');
    else if (bmiValue < 25) setBMICategory('Normal');
    else if (bmiValue < 30) setBMICategory('Overweight');
    else setBMICategory('Obese');

    saveData('bmi', { value: roundedBmi });
  };

  const calculateBP = () => {
    if (!systolic || !diastolic) return;

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (sys < 90 || dia < 60) setBPCategory('Hypotension (Low BP)');
    else if (sys >= 140 || dia >= 90) setBPCategory('Hypertension (High BP)');
    else if (sys >= 120 || dia >= 80) setBPCategory('Pre-Hypertension');
    else setBPCategory('Normal BP');

    saveData('bp', { systolic: sys, diastolic: dia });
  };

  const bmiChartData = {
    labels: healthData?.bmiHistory.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'BMI History',
        data: healthData?.bmiHistory.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  
  const bpChartData = {
    labels: healthData?.bpHistory.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Systolic',
        data: healthData?.bpHistory.map(d => d.systolic),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Diastolic',
        data: healthData?.bpHistory.map(d => d.diastolic),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      }
    ]
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
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
                Calculate & Save BMI
              </button>

              {bmi && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-lg font-medium">Your BMI: {bmi}</p>
                  <p className="text-gray-600">Category: {bmiCategory}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg text-gray-600 font-medium mb-2">BMI History</h3>
                <div className="h-64">
                  <Line data={bmiChartData} options={{ maintainAspectRatio: false }} />
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
                Calculate & Save BP
              </button>

              {bpCategory && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-lg font-medium">Your BP: {systolic}/{diastolic} mmHg</p>
                  <p className="text-gray-600">Category: {bpCategory}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg text-gray-600 font-medium mb-2">Blood Pressure History</h3>
                <div className="h-64">
                  <Line data={bpChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 