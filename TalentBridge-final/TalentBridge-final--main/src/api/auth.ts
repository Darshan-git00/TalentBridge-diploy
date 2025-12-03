// Authentication API endpoints
// TODO: Replace with real backend API calls

export interface LoginRequest {
  email: string;
  password: string;
  role: 'student' | 'college' | 'recruiter';
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'college' | 'recruiter';
  collegeId?: string;
  [key: string]: any;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    collegeId?: string;
  };
  token: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to login');
  return response.json();
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to signup');
  return response.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!response.ok) throw new Error('Failed to refresh token');
  return response.json();
}
