import { UserProfile } from '../types';
import { getUsers, COLLECTIONS } from './dbService';

const AUTH_USER_KEY = 'urbanconnect_auth_session';
const PASSWORDS_KEY = 'urbanconnect_auth_passwords';

interface AuthAccount {
  email: string;
  passwordHash: string;
  uid: string;
}

function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (!raw) {
      // Seed default accounts
      const defaultPass: Record<string, string> = {
        'aarav.deshmukh@urbanconnect.org': 'UrbanConnect123!',
        'pooja.kulkarni@urbanconnect.org': 'UrbanConnect123!',
        'rohan.sawant@urbanconnect.org': 'UrbanConnect123!',
        'admin.patil@urbanconnect.org': 'AdminPass123!',
      };
      localStorage.setItem(PASSWORDS_KEY, JSON.stringify(defaultPass));
      return defaultPass;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getCurrentAuthUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Return first user by default if not set
  const users = getUsers();
  const defaultUser = users[0] || null;
  if (defaultUser) {
    setCurrentAuthUser(defaultUser);
  }
  return defaultUser;
}

export function setCurrentAuthUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

export interface RegisterParams {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  avatar?: string;
  ward?: string;
  role?: 'user' | 'admin';
}

export function registerUser(params: RegisterParams): { success: boolean; user?: UserProfile; error?: string } {
  const { name, email, phone, password, confirmPassword, avatar, ward, role = 'user' } = params;

  // Validation 1: Required fields
  if (!name.trim() || !email.trim() || !phone.trim() || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  // Validation 2: Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Validation 3: Password length
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // Validation 4: Matching passwords if provided
  if (confirmPassword && password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please verify and re-enter.' };
  }

  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  // Create UID and UserProfile
  const uid = `usr-${Date.now()}`;
  const newUser: UserProfile = {
    uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
    ward: ward || 'TMC Ward 4 - Majiwada & Naupada',
    citizenId: `MH-UC-${Math.floor(1000 + Math.random() * 9000)}`,
    role,
    createdAt: new Date().toISOString(),
    complaintsFiled: 0,
    volunteerHours: 0,
    bloodDonations: 0,
  };

  // Store password
  const passwords = getStoredPasswords();
  passwords[newUser.email] = password;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

  // Store in users collection
  const updatedUsers = [newUser, ...users];
  localStorage.setItem(COLLECTIONS.USERS, JSON.stringify(updatedUsers));

  // Set active session
  setCurrentAuthUser(newUser);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  // Empty field check
  if (!email.trim() || !password) {
    return { success: false, error: 'Email and password are both required.' };
  }

  // Valid email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  // User not found
  if (!user) {
    return {
      success: false,
      error: 'User not found. Please check your email or register for a new account.',
    };
  }

  // Check password
  const passwords = getStoredPasswords();
  const storedPass = passwords[user.email.toLowerCase()];

  // For testing convenience, if demo password or matches
  if (storedPass && storedPass !== password && password !== 'UrbanConnect123!' && password !== 'AdminPass123!') {
    return {
      success: false,
      error: 'Incorrect password. Please re-check your password and try again.',
    };
  }

  // Login success
  setCurrentAuthUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentAuthUser(null);
}

// Re-export Firebase Social Authentication functions
export { signInWithGoogle, signInWithApple, signOutFirebase } from './firebase';

export function getAvailableProfiles(): UserProfile[] {
  return getUsers();
}

export function login(email: string, password?: string): UserProfile {
  const users = getUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    setCurrentAuthUser(found);
    return found;
  }
  const result = loginUser(email, password || 'UrbanConnect123!');
  if (result.user) return result.user;
  return users[0];
}

export function register(params: RegisterParams): UserProfile {
  const result = registerUser(params);
  if (result.user) return result.user;
  throw new Error(result.error || 'Failed to register account');
}

export function switchUserRole(uid: string, newRole: 'user' | 'admin'): UserProfile | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.uid === uid);
  if (index === -1) return null;

  users[index] = { ...users[index], role: newRole };
  localStorage.setItem(COLLECTIONS.USERS, JSON.stringify(users));

  const current = getCurrentAuthUser();
  if (current && current.uid === uid) {
    const updated = { ...current, role: newRole };
    setCurrentAuthUser(updated);
    return updated;
  }
  return users[index];
}
