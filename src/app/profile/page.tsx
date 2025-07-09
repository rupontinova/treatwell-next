"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Calendar, Users, VenetianMask, Key, LogOut, Camera, Trash2, Check, Shield, Edit, Save, X, ArrowLeft } from 'lucide-react';

interface IUser {
    _id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    address: string;
    gender: 'Male' | 'Female' | 'Other' | 'not-specified';
    dob: string | Date;
    nationalId: string;
    googleId?: string;
    profilePicture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    address: '',
    gender: 'not-specified' as 'Male' | 'Female' | 'Other' | 'not-specified',
    dob: '',
    nationalId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const calculateAge = (dob: string | Date): number | string => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Check if date is invalid or default
    if (!dob || birthDate.getFullYear() === 1970 || isNaN(birthDate.getTime())) {
      return 'Not specified';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper function to display user-friendly values
  const getDisplayValue = (value: string, field: string): string => {
    if (!value || value === 'not-provided' || value === 'not-specified') {
      return 'Not specified';
    }
    
    // For Google OAuth users with random IDs
    if (field === 'nationalId' && value.startsWith('google-')) {
      return 'Not specified';
    }
    
    return value;
  };

  // Helper function to get display gender
  const getDisplayGender = (gender: string): string => {
    if (gender === 'not-specified' || !gender) {
      return 'Not specified';
    }
    return gender;
  };

  // Check if user is Google OAuth user
  const isGoogleUser = userData?.googleId ? true : false;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch profile');
        }

        const data = await res.json();
        setUserData(data.data);
        setFormData({
            fullName: data.data.fullName,
            username: data.data.username,
            phone: data.data.phone,
            address: data.data.address,
            gender: data.data.gender || 'not-specified',
            dob: data.data.dob ? new Date(data.data.dob).toISOString().split('T')[0] : '',
            nationalId: data.data.nationalId || ''
        });
        setProfileImage(data.data.profilePicture);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
        if (err instanceof Error && (err.message === 'Invalid token' || err.message === 'No token provided')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setUserData(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
        setLoading(false);
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        setProfileImage(result.filePath);
        setUserData(prev => prev ? {...prev, profilePicture: result.filePath} as IUser : null);
        setSuccess("Profile picture updated!");

    } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleRemovePhoto = () => {
    // Implement API call to remove photo if needed
      setProfileImage(null);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    router.push('/login');
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }
  
  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center py-3">
        <div className="text-gray-400 w-6 h-6 mr-4">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    );

  if (loading && !userData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-gray-600">Loading your profile...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-red-500">Error: {error}</p></div>;
  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-gray-600">Could not load profile. Please try again.</p></div>;

    return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="text-3xl font-bold text-blue-600 cursor-pointer select-none" onClick={() => router.push('/')}>TreatWell</div>
        <div className="flex items-center gap-4">
            <Link href="/appointments" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Appointments</Link>
            <Link href="/health-tracker" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Health Tracker</Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 flex items-center gap-2">
                <LogOut size={18}/> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex-1"></div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">My Profile</h1>
            <p className="text-lg text-gray-500">View and manage your personal information and settings.</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium text-center">❌ {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium text-center">✅ {success}</div>}

        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Picture & Welcome */}
                <div className="lg:col-span-1 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-6 group">
                        <Image src={profileImage || '/default-avatar.png'} alt="Profile" width={128} height={128} className="rounded-full object-cover border-4 border-blue-200 shadow-md w-full h-full"/>
                        <button onClick={triggerFileInput} className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-all duration-300" title="Change photo">
                            <Camera size={18} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{userData.fullName}</h2>
                    <p className="text-gray-500 mb-4">{userData.email}</p>
                    <div className="mt-6 w-full space-y-2">
                        <button onClick={() => setIsEditing(!isEditing)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all">
                            {isEditing ? <><X size={18}/> Cancel</> : <><Edit size={18}/> Edit Profile</>}
                    </button>
                        
                        {/* Show Change Password only for non-Google users */}
                        {!isGoogleUser ? (
                         <Link href="/forgot-password?from=profile" legacyBehavior>
                           <a className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all">
                                <Key size={18}/> Change Password
                           </a>
                        </Link>
                        ) : (
                            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Key size={16}/> 
                                    <span className="font-medium">Password Management</span>
                                </div>
                                <p className="text-sm text-blue-500">
                                    You signed in with Google. Password changes are managed through your Google account.
                                </p>
                            </div>
                        )}
                    </div>
          </div>

                {/* Right Column - User Details */}
                <div className="lg:col-span-2">
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" name="phone" value={formData.phone === 'not-provided' ? '' : formData.phone} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" name="address" value={formData.address === 'not-provided' ? '' : formData.address} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                        <option value="not-specified">Not specified</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                                    <input type="text" name="nationalId" value={formData.nationalId.startsWith('google-') ? '' : formData.nationalId} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" placeholder="Enter your national ID number"/>
              </div>
            </div>
                           <div className="flex justify-end gap-4">
                               <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all">Cancel</button>
                               <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400">
                                   {loading ? 'Saving...' : 'Save Changes'}
                               </button>
              </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <DetailItem icon={<User />} label="Full Name" value={userData.fullName} />
                            <DetailItem icon={<VenetianMask />} label="Username" value={userData.username} />
                            <DetailItem icon={<Mail />} label="Email" value={userData.email} />
                            <DetailItem icon={<Phone />} label="Phone" value={getDisplayValue(userData.phone, 'phone')} />
                            <DetailItem icon={<MapPin />} label="Address" value={getDisplayValue(userData.address, 'address')} />
                            <DetailItem icon={<Users />} label="Gender" value={getDisplayGender(userData.gender)} />
                            <DetailItem icon={<Calendar />} label="Age" value={calculateAge(userData.dob)} />
                            <DetailItem icon={<Shield />} label="National ID" value={getDisplayValue(userData.nationalId, 'nationalId')} />
              </div>
                    )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 