export type AdminRole = 'super_admin' | 'admin';

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    admin: Admin;
    token: string;
  };
}

