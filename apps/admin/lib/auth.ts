import { auth, functions } from './firebase';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signInWithCustomToken, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AdminLoginResponse {
  success: boolean;
  customToken?: string;
  user?: {
    uid: string;
    email: string;
    role: string;
    permissions: string[];
  };
  error?: string;
}

/**
 * Authenticate admin user using email/password
 * This will use Firebase Auth directly + callable function for admin verification
 */
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser> {
  try {
    // First, try to sign in with Firebase Auth directly
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token to check custom claims
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims as Record<string, unknown>;

    // Check if user has admin privileges
    if (!claims.admin && claims.role !== 'admin') {
      // Sign out the user since they don't have admin privileges
      await signOut(auth);
      throw new Error('Insufficient admin privileges');
    }

    // Convert to our admin user format
    return {
      id: user.uid,
      username: user.displayName || email.split('@')[0],
      email: user.email || email,
      name: user.displayName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      role: (claims.role as string) || 'admin',
      permissions: (claims.permissions as string[]) || ['events', 'forums', 'users']
    };

  } catch (error: unknown) {
    console.error('Admin authentication error:', error);
    
    // Handle specific Firebase Auth errors
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    } else if (firebaseError.code === 'auth/wrong-password') {
      throw new Error('Invalid password');
    } else if (firebaseError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (firebaseError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later');
    } else if (firebaseError.message === 'Insufficient admin privileges') {
      throw new Error('This account does not have admin privileges');
    } else {
      throw new Error('Login failed. Please check your credentials');
    }
  }
}

/**
 * Alternative method using callable function (if direct auth doesn't work)
 */
export async function authenticateAdminWithFunction(email: string, password: string): Promise<AdminUser> {
  try {
    // Call Firebase Callable Function
    const adminLogin = httpsCallable(functions, 'adminLogin');
    
    const result = await adminLogin({ email, password });
    const { success, customToken, user, error } = result.data as AdminLoginResponse;

    if (!success) {
      throw new Error(error || 'Authentication failed');
    }

    if (!customToken || !user) {
      throw new Error('Invalid response from authentication service');
    }

    // Sign in with the custom token from Cloud Function
    await signInWithCustomToken(auth, customToken);

    // Convert to our admin user format
    return {
      id: user.uid,
      username: user.email.split('@')[0],
      email: user.email,
      name: user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      role: user.role,
      permissions: user.permissions
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    throw new Error('Invalid email or password');
  }
}

/**
 * Check if current user is an authenticated admin
 */
export function isCurrentUserAdmin(): Promise<boolean> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        // Check custom claims for admin role
        user.getIdTokenResult().then((idTokenResult) => {
          const isAdmin = idTokenResult.claims.admin === true || idTokenResult.claims.role === 'admin';
          resolve(isAdmin);
        }).catch(() => resolve(false));
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * Get current admin user's ID token for API calls
 */
export async function getAdminIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Sign out admin user
 */
export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to admin authentication state changes
 */
export function onAdminAuthStateChanged(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult();
        const isAdmin = idTokenResult.claims.admin === true || idTokenResult.claims.role === 'admin';
        callback(user, isAdmin);
      } catch {
        callback(user, false);
      }
    } else {
      callback(null, false);
    }
  });
}
