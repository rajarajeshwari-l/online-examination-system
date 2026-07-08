export type UserRole = 'admin' | 'student';

export interface BaseUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarColor: string;
  createdAt: string;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  department: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  rollNumber: string;
  batch: string;
  phone: string;
  status: 'active' | 'suspended';
}

export type AppUser = AdminUser | StudentUser;

export interface AuthSession {
  userId: string;
  role: UserRole;
  fullName: string;
  email: string;
  loginAt: string;
  expiresAt: string;
}

export interface RegisterStudentPayload {
  fullName: string;
  email: string;
  password: string;
  rollNumber: string;
  batch: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
