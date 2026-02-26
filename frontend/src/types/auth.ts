// frontend/src/types/auth.ts

export type UserRole = 'USER' | 'ORGANIZATION' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'USER' | 'ORGANIZATION';
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}