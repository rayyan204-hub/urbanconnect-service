import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';
import { getUsers, COLLECTIONS } from './dbService';
import { setCurrentAuthUser } from './authService';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connection failed. Check network or config.');
    }
  }
}
testConnection();

// Standard Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Maps a Firebase User and provider name to an UrbanConnect UserProfile.
 * Merges with existing local profile if previously logged in.
 */
export async function syncFirebaseUserToProfile(
  fbUser: FirebaseUser,
  providerLabel: 'Google' | 'Apple'
): Promise<UserProfile> {
  const users = getUsers();
  const existingUser = users.find(
    (u) => u.uid === fbUser.uid || (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase())
  );

  const fallbackWard = 'TMC Ward 4 - Majiwada & Naupada';
  const defaultAvatar =
    providerLabel === 'Google'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  const profile: UserProfile = {
    uid: fbUser.uid,
    name: fbUser.displayName || existingUser?.name || `${providerLabel} Resident`,
    email: fbUser.email || existingUser?.email || `resident-${fbUser.uid.slice(0, 6)}@urbanconnect.org`,
    phone: fbUser.phoneNumber || existingUser?.phone || '+1 (555) 019-2831',
    avatar: fbUser.photoURL || existingUser?.avatar || defaultAvatar,
    ward: existingUser?.ward || fallbackWard,
    citizenId: existingUser?.citizenId || `MH-UC-${fbUser.uid.slice(0, 4).toUpperCase()}`,
    role: existingUser?.role || 'user',
    createdAt: existingUser?.createdAt || new Date().toISOString(),
    complaintsFiled: existingUser?.complaintsFiled || 0,
    volunteerHours: existingUser?.volunteerHours || 0,
    bloodDonations: existingUser?.bloodDonations || 0,
  };

  // Persist locally
  const index = users.findIndex((u) => u.uid === profile.uid || u.email.toLowerCase() === profile.email.toLowerCase());
  let updatedUsers: UserProfile[];
  if (index >= 0) {
    updatedUsers = [...users];
    updatedUsers[index] = profile;
  } else {
    updatedUsers = [profile, ...users];
  }
  localStorage.setItem(COLLECTIONS.USERS, JSON.stringify(updatedUsers));

  // Sync to Firestore user document
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (non-fatal):', err);
  }

  // Update session
  setCurrentAuthUser(profile);
  return profile;
}

/**
 * Sign in using Firebase Google Auth Provider via Popup
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncFirebaseUserToProfile(result.user, 'Google');
    return { success: true, user: profile };
  } catch (err: any) {
    console.error('Google Sign-in failed:', err);
    let errorMessage = 'Google authentication failed. Please try again.';

    if (err?.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Google sign-in popup was closed before completing.';
    } else if (err?.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in request was cancelled by a newer attempt.';
    } else if (err?.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    } else if (err?.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google provider is not enabled in Firebase Console. Please verify Auth settings.';
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Sign in using Firebase Apple OAuth Provider via Popup
 */
export async function signInWithApple(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const profile = await syncFirebaseUserToProfile(result.user, 'Apple');
    return { success: true, user: profile };
  } catch (err: any) {
    console.error('Apple Sign-in failed:', err);
    let errorMessage = 'Apple authentication failed. Please try again.';

    if (err?.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Apple sign-in popup was closed before completing.';
    } else if (err?.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in request was cancelled by a newer attempt.';
    } else if (err?.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by the browser. Please allow popups for this site.';
    } else if (err?.code === 'auth/operation-not-allowed') {
      errorMessage =
        'Apple Sign-In is not yet enabled in the Firebase Console. You can enable Apple in Firebase Console > Authentication > Sign-in method.';
    } else if (err?.code === 'auth/configuration-not-found') {
      errorMessage =
        'Apple Sign-In provider configuration not found in Firebase. Please enable Apple in Firebase Console.';
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Sign out of Firebase and clear active session
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Error signing out from Firebase:', err);
  }
  setCurrentAuthUser(null);
}
