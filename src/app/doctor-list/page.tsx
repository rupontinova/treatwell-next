'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const mockDoctors = [
  {
    id: 1,
    name: 'jsdhcdcc',
    speciality: 'Cardiology',
    isRegistered: true,
    location: 'sdcsdcdc',
    designation: 'Ssdc',
    qualification: 'sdcdC',
    about: 'sdcsdcsdc',
    phone: '+1234567890',
  },
  {
    id: 2,
    name: 'sdcsdcsdc',
    speciality: 'Neurology',
    isRegistered: false,
    location: 'sdcsdc',
    designation: 'Neurologist',
    qualification: 'sdcsdcsdc',
    about: 'Sejvcehcjrvrvrvrvrvrvrrv',
    phone: '+1987654321',
  },

];

const specialities = [
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'General Medicine',
];

export default function DoctorList() {
  const router = useRouter();
  const [searchName, setSearchName] = useState('');
  const [searchSpeciality, setSearchSpeciality] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'sl', direction: 'asc' });

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const nameMatch = doctor.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const specialityMatch =
      !searchSpeciality || doctor.speciality === searchSpeciality;
    return nameMatch && specialityMatch;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortConfig.key === 'sl') {
      return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
    }
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === 'speciality') {
      return sortConfig.direction === 'asc'
        ? a.speciality.localeCompare(b.speciality)
        : b.speciality.localeCompare(a.speciality);
    }
    return 0;
  });

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Find Your Doctor</h1>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
                placeholder="Enter doctor's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Speciality
              </label>
              <select
                value={searchSpeciality}
                onChange={(e) => setSearchSpeciality(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-600"
              >
                <option value="">All Specialities</option>
                {specialities.map((speciality) => (
                  <option key={speciality} value={speciality}>
                    {speciality}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort('sl')}
                  >
                    SL No {sortConfig.key === 'sl' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort('name')}
                  >
                    Doctor Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort('speciality')}
                  >
                    Speciality {sortConfig.key === 'speciality' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDoctors.map((doctor, index) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.speciality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {doctor.isRegistered ? (
                        <button
                          onClick={() => router.push(`/book-appointment/${doctor.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Book Appointment
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                        >
                          Book Appointment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 