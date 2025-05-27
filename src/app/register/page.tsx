"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  username: "",
  fullName: "",
  gender: "",
  dob: "",
  nationalId: "",
  password: "",
  phone: "",
  address: "",
  email: "",
};

function calculateAge(dob: string) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    for (const key in form) {
      if (!form[key as keyof typeof form]) {
        setError("All fields must be completed before registering!");
        return false;
      }
    }
    // Email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Please enter a valid email address!");
      return false;
    }
    // Password length
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return false;
    }
    // Phone validation (simple)
    if (!/^\+?\d{10,15}$/.test(form.phone)) {
      setError("Please enter a valid phone number!");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    setSuccess("Registration successful! Please log in.");
    localStorage.setItem("isLoggedIn", "true");
    setTimeout(() => router.push("/"), 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-6xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register</h2>
        {error && <div className="mb-4 text-red-600 text-center">❌ {error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">✅ {success}</div>}
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Username</label>
              <input type="text" name="username" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Full Name</label>
              <input type="text" name="fullName" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Gender</label>
              <select name="gender" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Date of Birth (YYYY-MM-DD)</label>
              <input type="date" name="dob" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.dob} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">National ID (NID/Passport Number)</label>
              <input type="text" name="nationalId" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.nationalId} onChange={handleChange} required />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Password</label>
              <input type="password" name="password" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Phone Number</label>
              <input type="text" name="phone" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.phone} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Address</label>
              <input type="text" name="address" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.address} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Email Address</label>
              <input type="email" name="email" className="w-full text-gray-600 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Age</label>
              <input type="text" value={calculateAge(form.dob)} readOnly className="w-full text-gray-600 px-3 py-2 border rounded bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-4" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <div className="flex justify-between">
            <a href="/login" className="text-blue-500 hover:underline text-sm">Already have an account? Click here!</a>
            <a href="/" className="text-gray-500 hover:underline text-sm">Return to Homepage</a>
          </div>
        </div>
      </form>
    </div>
  );
} 