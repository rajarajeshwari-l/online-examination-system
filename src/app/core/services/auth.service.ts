import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { PasswordHasherService } from './password-hasher.service';
import { IdGeneratorService } from './id-generator.service';
import { environment } from '../../../environments/environment';
import {
  AppUser,
  AuthSession,
  LoginPayload,
  RegisterStudentPayload,
  StudentUser
} from '../models';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

export interface AuthResult {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _session = signal<AuthSession | null>(this.restoreSession());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly currentRole = computed(() => this._session()?.role ?? null);
  readonly currentUserName = computed(() => this._session()?.fullName ?? '');

  constructor(
    private readonly storage: StorageService,
    private readonly hasher: PasswordHasherService,
    private readonly idGenerator: IdGeneratorService
  ) {}

  login(payload: LoginPayload): AuthResult {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

    if (!user) {
      return { success: false, message: 'No account found with that email address.' };
    }
    if (!this.hasher.verify(payload.password, user.passwordHash)) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    if (user.role === 'student' && (user as StudentUser).status === 'suspended') {
      return { success: false, message: 'This account has been suspended. Contact your administrator.' };
    }

    this.establishSession(user);
    return { success: true, message: `Welcome back, ${user.fullName.split(' ')[0]}!` };
  }

  registerStudent(payload: RegisterStudentPayload): AuthResult {
    const users = this.getAllUsers();
    const emailTaken = users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (emailTaken) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newStudent: StudentUser = {
      id: this.idGenerator.generate('user'),
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: this.hasher.hash(payload.password),
      role: 'student',
      rollNumber: payload.rollNumber,
      batch: payload.batch,
      phone: payload.phone,
      status: 'active',
      avatarColor: this.randomAvatarColor(),
      createdAt: new Date().toISOString()
    };

    this.storage.set(USERS_KEY, [...users, newStudent]);
    this.establishSession(newStudent);
    return { success: true, message: 'Account created successfully. Welcome aboard!' };
  }

  logout(): void {
    this.storage.remove(SESSION_KEY);
    this._session.set(null);
  }

  getAllUsers(): AppUser[] {
    return this.storage.get<AppUser[]>(USERS_KEY, []);
  }

  getUserById(id: string): AppUser | undefined {
    return this.getAllUsers().find((u) => u.id === id);
  }

  updateUser(updated: AppUser): void {
    const users = this.getAllUsers().map((u) => (u.id === updated.id ? updated : u));
    this.storage.set(USERS_KEY, users);

    const current = this._session();
    if (current && current.userId === updated.id) {
      this.establishSession(updated, false);
    }
  }

  private establishSession(user: AppUser, persistUsers = true): void {
    const now = new Date();
    const expires = new Date(now.getTime() + environment.sessionTimeoutMinutes * 60_000);
    const session: AuthSession = {
      userId: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      loginAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };
    this.storage.set(SESSION_KEY, session);
    this._session.set(session);
    void persistUsers;
  }

  private restoreSession(): AuthSession | null {
    const session = this.storage.get<AuthSession | null>(SESSION_KEY, null);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.storage.remove(SESSION_KEY);
      return null;
    }
    return session;
  }

  private randomAvatarColor(): string {
    const palette = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
    return palette[Math.floor(Math.random() * palette.length)];
  }
}
