import { auth, db } from './firebase';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

/**
 * Check if user is admin based on Firestore document
 * Collection: admins, Document ID: user UID
 */
async function isAdmin(uid: string): Promise<boolean> {
  try {
    console.log('🔍 Starting admin check for UID:', uid);
    console.log('📍 Firebase project:', db.app.name);
    console.log('🔐 Current auth user:', auth.currentUser?.uid);
    console.log('🔐 Auth state matches UID:', auth.currentUser?.uid === uid);
    
    const adminDocRef = doc(db, "admins", uid);
    console.log('📄 Document path:', adminDocRef.path);
    console.log('📄 Full document reference:', adminDocRef);
    
    console.log('⏳ Attempting Firestore read...');
    const adminDoc = await getDoc(adminDocRef);
    
    console.log('✅ Firestore read completed successfully');
    console.log('📋 Document exists:', adminDoc.exists());
    
    if (adminDoc.exists()) {
      console.log('📊 Document data:', adminDoc.data());
      console.log('🆔 Document ID:', adminDoc.id);
      console.log('✅ User is an admin!');
    } else {
      console.log('❌ Document does not exist in admins collection');
      console.log('💡 Create a document with ID:', uid, 'in the admins collection');
    }
    
    return adminDoc.exists();
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('📝 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🔧 Error code:', (error as { code?: string })?.code);
    console.error('📋 Full error object:', error);
    
    // Check if it's a permissions error
    if (error instanceof Error && error.message.includes('permissions')) {
      console.error('🚨 PERMISSIONS ERROR DETECTED');
      console.error('🔍 This could be due to:');
      console.error('   1. Firestore rules blocking access');
      console.error('   2. User not authenticated when checking');
      console.error('   3. Wrong Firebase project configuration');
      console.error('   4. Document path issues');
    }
    
    return false;
  }
}

/**
 * Authenticate admin user using Firebase Auth + Firestore admin verification
 * 
 * Step 1: Firebase Auth handles user authentication (email/password)
 * Step 2: Firestore handles admin privilege checking (document exists in admins collection)
 * 
 * No custom claims needed - admin status is purely based on Firestore document existence
 */
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser> {
  try {
    console.log('🚀 Starting admin authentication for email:', email);
    
    // Step 1: Standard Firebase Auth - just authenticate the user
    // This doesn't check for admin privileges, just validates email/password
    console.log('🔐 Step 1: Authenticating with Firebase Auth...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth successful!');
    console.log('👤 User UID:', user.uid);
    console.log('📧 User email:', user.email);
    console.log('📝 User display name:', user.displayName);
    
    // Wait a moment for auth state to settle
    console.log('⏳ Waiting for auth state to settle...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Separate admin check using Firestore
    // This is completely independent of Firebase Auth
    console.log('🔍 Step 2: Checking admin privileges via Firestore...');
    const isUserAdmin = await isAdmin(user.uid);
    
    console.log('📋 Admin check result:', isUserAdmin);
    
    if (!isUserAdmin) {
      console.log('❌ User is not an admin, signing out...');
      // User is authenticated but not an admin, so sign them out
      await signOut(auth);
      throw new Error('This account does not have admin privileges');
    }

    console.log('🎉 Admin authentication successful!');
    // Create admin user object with default admin properties
    const adminUser = {
      id: user.uid,
      username: user.displayName || email.split('@')[0],
      email: user.email || email,
      name: user.displayName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      role: 'admin',
      permissions: ['events', 'forums', 'users', 'settings']
    };
    
    console.log('👤 Created admin user object:', adminUser);
    return adminUser;

  } catch (error: unknown) {
    console.error('❌ Admin authentication error:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('📝 Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    const firebaseError = error as { code?: string; message?: string };
    console.error('🔧 Firebase error code:', firebaseError.code);
    
    if (firebaseError.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    } else if (firebaseError.code === 'auth/wrong-password') {
      throw new Error('Invalid password');
    } else if (firebaseError.code === 'auth/invalid-email') {
      throw new Error('Invalid email address');
    } else if (firebaseError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later');
    } else if (firebaseError.message?.includes('admin privileges')) {
      throw new Error('This account does not have admin privileges');
    } else {
      throw new Error('Login failed. Please check your credentials');
    }
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
        const isUserAdmin = await isAdmin(user.uid);
        callback(user, isUserAdmin);
      } catch {
        callback(user, false);
      }
    } else {
      callback(null, false);
    }
  });
}
