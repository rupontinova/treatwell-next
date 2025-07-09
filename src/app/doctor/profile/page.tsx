"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Calendar, Users, VenetianMask, Key, LogOut, Camera, Trash2, Check, Shield, Edit, Save, X, ArrowLeft, Stethoscope, GraduationCap, Briefcase, CreditCard, CheckCircle } from 'lucide-react';

interface IDoctor {
    _id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    gender: string;
    speciality: string;
    isRegistered: boolean;
    location: string;
    designation: string;
    qualification: string;
    about: string;
    bmdcNumber: string;
    profilePicture?: string;
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doctorData, setDoctorData] = useState<IDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    gender: '',
    speciality: '',
    location: '',
    designation: '',
    qualification: '',
    about: '',
    bmdcNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper function to display user-friendly values
  const getDisplayValue = (value: string, field: string): string => {
    if (!value || value === 'not-provided' || value === 'not-specified') {
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

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/doctor/login');
          return;
        }

        // Decode token to get doctor ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        const doctorId = payload.id;
        
        if (payload.role !== 'doctor') {
          router.push('/doctor/login');
          return;
        }

        const res = await fetch(`/api/doctors/${doctorId}`);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch profile');
        }

        const data = await res.json();
        setDoctorData(data.data);
        setFormData({
            name: data.data.name,
            username: data.data.username,
            phone: data.data.phone,
            gender: data.data.gender || '',
            speciality: data.data.speciality,
            location: data.data.location,
            designation: data.data.designation,
            qualification: data.data.qualification,
            about: data.data.about,
            bmdcNumber: data.data.bmdcNumber
        });
        setProfileImage(data.data.profilePicture);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
        if (err instanceof Error && (err.message.includes('token') || err.message.includes('Unauthorized'))) {
          localStorage.removeItem('token');
          router.push('/doctor/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [router]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token!.split('.')[1]));
        const doctorId = payload.id;
        
        const res = await fetch(`/api/doctors/${doctorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setDoctorData(result.data);
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
        const res = await fetch('/api/auth/doctor/profile/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body,
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        setProfileImage(result.filePath);
        setDoctorData(prev => prev ? {...prev, profilePicture: result.filePath} as IDoctor : null);
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
    sessionStorage.clear();
    router.push('/doctor/login');
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/doctor');
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

  if (loading && !doctorData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-gray-600">Loading your profile...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-red-500">Error: {error}</p></div>;
  if (!doctorData) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-gray-600">Could not load profile. Please try again.</p></div>;

    return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="text-3xl font-bold text-blue-600 cursor-pointer select-none" onClick={() => router.push('/doctor')}>TreatWell</div>
        <div className="hidden md:flex items-center space-x-6">
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/doctor/appointments")}>
            Appointments
          </button>
          <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors" onClick={() => router.push("/doctor/medical-history")}>
            Medical History
          </button>
        </div>
        <div className="flex items-center gap-4">
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Doctor Profile</h1>
            <p className="text-lg text-gray-500">View and manage your professional information and settings.</p>
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Dr. {doctorData.name}</h2>
                    <p className="text-gray-500 mb-1">{doctorData.email}</p>
                    <p className="text-blue-600 font-medium mb-4">{doctorData.speciality}</p>
                    
                    {/* Registration Status */}
                    <div className="mt-4 w-full">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            doctorData.isRegistered 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                            {doctorData.isRegistered ? (
                                <>
                                    <CheckCircle size={16} className="mr-2" />
                                    Verified Doctor
                                </>
                            ) : (
                                <>
                                    <Check size={16} className="mr-2" />
                                    Pending Verification
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 w-full space-y-2">
                        <button onClick={() => setIsEditing(!isEditing)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all">
                            {isEditing ? <><X size={18}/> Cancel</> : <><Edit size={18}/> Edit Profile</>}
                    </button>
                    </div>
          </div>

                {/* Right Column - Doctor Details */}
                <div className="lg:col-span-2">
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                                        <option value="">Not specified</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                                    <input type="text" name="speciality" value={formData.speciality} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input type="text" name="designation" value={formData.designation} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                    <input type="text" name="qualification" value={formData.qualification} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"/>
              </div>
              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">BMDC Number</label>
                                    <input type="text" name="bmdcNumber" value={formData.bmdcNumber} onChange={handleFormChange} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium" disabled title="BMDC number cannot be changed"/>
              </div>
              <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                                    <textarea name="about" value={formData.about} onChange={handleFormChange} rows={4} className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium resize-none" placeholder="Tell patients about yourself..."/>
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
                            <DetailItem icon={<User />} label="Full Name" value={`Dr. ${doctorData.name}`} />
                            <DetailItem icon={<VenetianMask />} label="Username" value={doctorData.username} />
                            <DetailItem icon={<Mail />} label="Email" value={doctorData.email} />
                            <DetailItem icon={<Phone />} label="Phone" value={getDisplayValue(doctorData.phone, 'phone')} />
                            <DetailItem icon={<Users />} label="Gender" value={getDisplayGender(doctorData.gender)} />
                            <DetailItem icon={<Stethoscope />} label="Speciality" value={doctorData.speciality} />
                            <DetailItem icon={<MapPin />} label="Location" value={doctorData.location} />
                            <DetailItem icon={<Briefcase />} label="Designation" value={doctorData.designation} />
                            <DetailItem icon={<GraduationCap />} label="Qualification" value={doctorData.qualification} />
                            <DetailItem icon={<CreditCard />} label="BMDC Number" value={doctorData.bmdcNumber} />
                            
                            {/* About Section - Full Width */}
                            <div className="md:col-span-2 py-3">
                                <div className="flex items-start">
                                    <div className="text-gray-400 w-6 h-6 mr-4 mt-1">
                                        <User />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500 mb-2">About</p>
                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                            {doctorData.about || 'No description available.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
              </div>
                    )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">TreatWell for Doctors</h3>
              <p className="text-gray-400 max-w-sm">
                The all-in-one platform to enhance your practice, connect with patients, and deliver outstanding care.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => router.push("/doctor/appointments")} className="text-gray-400 hover:text-white transition">Appointments</button></li>
                <li><button onClick={() => router.push("/doctor/medical-history")} className="text-gray-400 hover:text-white transition">Medical History</button></li>
                <li><button onClick={() => router.push("/doctor/login")} className="text-gray-400 hover:text-white transition">Login</button></li>
                <li><button onClick={() => router.push("/doctor/register")} className="text-gray-400 hover:text-white transition">Register</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><p>Ruponti Muin Nova</p></li>
                <li><p>Jawad Anzum Fahim</p></li>
                <li className="pt-2"><a href="mailto:support@treatwell.com" className="hover:text-white transition">support@treatwell.com</a></li>
              </ul>
            </div>
             <div>
              <h3 className="text-lg font-semibold mb-4">Feedback</h3>
               <p className="text-gray-400 mb-2 text-sm">Help us improve our services.</p>
              <button 
                onClick={() => router.push("/feedback")}
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