'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authenticateAdmin, signOutAdmin, onAdminAuthStateChanged, AdminUser } from '@/lib/auth';

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((firebaseUser, isAdmin) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && isAdmin) {
        // Create admin user from Firebase user data
        const adminUser: AdminUser = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'admin',
          email: firebaseUser.email || '',
          name: (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'admin')
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          role: 'admin',
          permissions: ['events', 'forums', 'users', 'settings']
        };
        setUser(adminUser);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use Firebase Auth + Firestore admin verification
      const adminUser = await authenticateAdmin(email, password);
      setUser(adminUser);
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutAdmin();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout locally even if Firebase logout fails
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
