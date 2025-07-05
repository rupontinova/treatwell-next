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
  Legend,
  ChartOptions
} from 'chart.js';
import { IHealthData } from '@/models/HealthData';
import { HeartPulse, Ruler, Weight, Activity, BrainCircuit, ArrowLeft, Trash2, X } from 'lucide-react';

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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

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

  const deleteData = async (type: 'bmi' | 'bp', index: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/health-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, index })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete data');
      }
      setHealthData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete health data');
    }
  };
  
  const calculateBMI = () => {
    if (!height || !weight) {
        setError("Please enter both height and weight.");
        return;
    }
    setError(null);

    let heightInMeters = parseFloat(height);
    let weightInKg = parseFloat(weight);

    if (heightUnit === 'cm') heightInMeters /= 100;
    else if (heightUnit === 'inches') heightInMeters *= 0.0254;

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
    if (!systolic || !diastolic) {
        setError("Please enter both systolic and diastolic pressure.");
        return;
    }
    setError(null);

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (sys < 90 || dia < 60) setBPCategory('Hypotension (Low BP)');
    else if (sys >= 140 || dia >= 90) setBPCategory('Hypertension (High BP)');
    else if (sys >= 120 || dia >= 80) setBPCategory('Pre-Hypertension');
    else setBPCategory('Normal');

    saveData('bp', { systolic: sys, diastolic: dia });
  };
  
  const getCategoryColor = (category: string) => {
      switch (category) {
          case 'Underweight': return 'text-blue-500';
          case 'Normal': return 'text-green-500';
          case 'Overweight': return 'text-yellow-500';
          case 'Obese': return 'text-red-500';
          case 'Hypotension (Low BP)': return 'text-blue-500';
          case 'Pre-Hypertension': return 'text-yellow-500';
          case 'Hypertension (High BP)': return 'text-red-500';
          default: return 'text-gray-800';
      }
  }

  const chartOptions: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            }
        },
        y: {
            grid: {
                color: '#e5e7eb'
            }
        }
    }
  };

  const bmiChartData = {
    labels: healthData?.bmiHistory.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'BMI History',
        data: healthData?.bmiHistory.map(d => d.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };
  
  const bpChartData = {
    labels: healthData?.bpHistory.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Systolic',
        data: healthData?.bpHistory.map(d => d.systolic),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Diastolic',
        data: healthData?.bpHistory.map(d => d.diastolic),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-gray-600">Loading your health dashboard...</p></div>
  if (error && !healthData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-red-500">Error: {error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
       <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div
          className="text-3xl font-bold text-blue-600 cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          TreatWell
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-gray-100"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Health Tracker</h1>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">Monitor your key health metrics to stay on top of your wellness goals.</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">❌ {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* BMI Calculator Section */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><BrainCircuit className="w-7 h-7 mr-3 text-blue-500" />BMI Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" placeholder="Enter height"/>
                  </div>
                  <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white">
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="inches">inches</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" placeholder="Enter weight"/>
                  </div>
                  <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white">
                    <option value="kg">kg</option>
                    <option value="pounds">pounds</option>
                  </select>
                </div>
              </div>

              <button onClick={calculateBMI} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300">Calculate & Save BMI</button>

              {bmi && (
                <div className="mt-4 p-4 bg-gray-50/70 rounded-lg text-center">
                  <p className="text-lg font-medium text-gray-800">Your BMI is <span className="font-bold text-2xl text-blue-600">{bmi}</span></p>
                  <p className={`text-md font-semibold ${getCategoryColor(bmiCategory)}`}>{bmiCategory}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">BMI History</h3>
                <div className="h-64 mb-4">
                  <Line data={bmiChartData} options={chartOptions} />
                </div>
                
                {/* BMI Records List */}
                {healthData?.bmiHistory && healthData.bmiHistory.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Records:</h4>
                    {healthData.bmiHistory.slice().reverse().map((record, reverseIndex) => {
                      const actualIndex = healthData.bmiHistory.length - 1 - reverseIndex;
                      return (
                        <div key={actualIndex} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-gray-900">BMI: {record.value}</span>
                              <p className="text-xs text-gray-600">{new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteData('bmi', actualIndex)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
                            title="Delete this BMI record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          </div>

          {/* BP Calculator Section */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><HeartPulse className="w-7 h-7 mr-3 text-red-500" />Blood Pressure Tracker</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Systolic Pressure (mmHg)</label>
                 <Activity className="absolute left-3 bottom-3 w-5 h-5 text-gray-400" />
                <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" placeholder="e.g., 120"/>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic Pressure (mmHg)</label>
                <Activity className="absolute left-3 bottom-3 w-5 h-5 text-gray-400" />
                <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" placeholder="e.g., 80"/>
              </div>

              <button onClick={calculateBP} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300">Calculate & Save BP</button>

              {bpCategory && (
                <div className="mt-4 p-4 bg-gray-50/70 rounded-lg text-center">
                  <p className="text-lg font-medium text-gray-800">Your BP is <span className="font-bold text-2xl text-blue-600">{systolic}/{diastolic}</span> mmHg</p>
                  <p className={`text-md font-semibold ${getCategoryColor(bpCategory)}`}>{bpCategory}</p>
                </div>
              )}
            </div>

             <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Blood Pressure History</h3>
                <div className="h-64 mb-4">
                  <Line data={bpChartData} options={chartOptions} />
                </div>
                
                {/* BP Records List */}
                {healthData?.bpHistory && healthData.bpHistory.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Records:</h4>
                    {healthData.bpHistory.slice().reverse().map((record, reverseIndex) => {
                      const actualIndex = healthData.bpHistory.length - 1 - reverseIndex;
                      return (
                        <div key={actualIndex} className="flex items-center justify-between bg-red-50 p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div>
                              <span className="font-medium text-gray-900">BP: {record.systolic}/{record.diastolic} mmHg</span>
                              <p className="text-xs text-gray-600">{new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteData('bp', actualIndex)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
                            title="Delete this BP record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">TreatWell</h3>
              <p className="text-gray-400 max-w-sm">
                Your comprehensive healthcare platform, connecting patients with doctors and providing tools for better health management.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => router.push("/doctor-list")} className="text-gray-400 hover:text-white transition">Find a Doctor</button></li>
                <li><button onClick={() => router.push("/appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => router.push("/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => router.push("/health-tracker")} className="text-gray-400 hover:text-white transition">Health Tracker</button></li>
                <li><button onClick={() => router.push("/login")} className="text-gray-400 hover:text-white transition">Login</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><p>Ruponti Muin Nova</p></li>
                <li><p>Jawad Anzum Fahim</p></li>
                <li className="pt-2"><a href="mailto:ruponti@gmail.com" className="hover:text-white transition">ruponti@gmail.com</a></li>
              </ul>
            </div>
             <div>
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>
               <p className="text-gray-400 mb-2 text-sm">We value your feedback!</p>
              <button 
                onClick={() => router.push("/")}
                className="text-blue-400 hover:text-blue-300 transition font-semibold"
              >
                Send Feedback
              </button>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} TreatWell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 