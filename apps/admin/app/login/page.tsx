'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { BrandLogo, LogoInstructions } from '@/components/brand-logo';
import { LoginForm } from '@/components/login-form';
import { Shield, Users, Calendar, MessageSquare } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if already authenticated (prevents flash)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C4DFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex">
      {/* Left Side - Login Form (White Background) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <BrandLogo variant="full" size="md" className="mx-auto mb-4" />
            <LogoInstructions />
          </div>

          {/* Login Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">
              Access the CareSpace admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Need help? Contact{' '}
              <a href="mailto:support@carespace.com" className="text-[#7C4DFF] hover:text-purple-600">
                support@carespace.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding and Info (Primary Color) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#7C4DFF] to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to CareSpace Admin
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Manage the migrant worker community platform with powerful admin tools.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-purple-300" />
              <span className="text-purple-100">Manage Events & Workshops</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-purple-300" />
              <span className="text-purple-100">Moderate Community Forums</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-purple-300" />
              <span className="text-purple-100">User Management & Analytics</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-purple-300/20 rounded-full"></div>
        <div className="absolute top-1/2 right-5 w-16 h-16 bg-purple-500/20 rounded-full"></div>
      </div>
    </div>
  );
}
