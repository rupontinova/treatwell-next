const API_URL = 'http://localhost:5001/api';

export interface LoginResponse {
  success: boolean;
  token: string;
  patient: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
}

export interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  gender: string;
  dob: string;
  nationalId: string;
  phone: string;
  address: string;
}

export interface ProfileData {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  gender: string;
  dob: string;
  nationalId: string;
  phone: string;
  address: string;
  createdAt: string;
  googleId?: string;
  profilePicture?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }
    return responseData;
  },

  async getProfile(): Promise<ProfileResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
    return data;
  },

  async googleLogin(credential: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },
}; 