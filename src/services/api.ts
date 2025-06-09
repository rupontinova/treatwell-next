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
}; 