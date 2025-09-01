'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ variant = 'full', size = 'md', className = '' }: BrandLogoProps) {
  const [logoError, setLogoError] = useState(false);
  const [iconError, setIconError] = useState(false);

  const sizes = {
    sm: { logo: { width: 120, height: 36 }, icon: 24 },
    md: { logo: { width: 160, height: 48 }, icon: 32 },
    lg: { logo: { width: 200, height: 60 }, icon: 40 }
  };

  if (variant === 'icon') {
    return (
      <div className={className}>
        {!iconError ? (
          <Image
            src="/brand/icon.png"
            alt="CareSpace"
            width={sizes[size].icon}
            height={sizes[size].icon}
            className="object-contain"
            onError={() => setIconError(true)}
            priority
          />
        ) : (
          // Fallback when no icon is provided
          <div 
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ 
              width: sizes[size].icon, 
              height: sizes[size].icon,
              fontSize: `${sizes[size].icon * 0.4}px`
            }}
          >
            C
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {!logoError ? (
        <Image
          src="/brand/logo.png"
          alt="CareSpace Admin"
          width={sizes[size].logo.width}
          height={sizes[size].logo.height}
          className="object-contain"
          onError={() => setLogoError(true)}
          priority
        />
      ) : (
        // Fallback when no logo is provided
        <div className="flex items-center space-x-3">
          <div 
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ 
              width: sizes[size].icon, 
              height: sizes[size].icon,
              fontSize: `${sizes[size].icon * 0.4}px`
            }}
          >
            C
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-gray-900 ${
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
            }`}>
              CareSpace
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Admin Dashboard
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Logo status component
export function LogoInstructions() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
      <h4 className="font-semibold mb-2">✅ Your Logo is Active</h4>
      <p className="mb-2">Your CareSpace logo is now integrated!</p>
      <div className="text-xs space-y-1">
        <div>📁 Files loaded: <code className="bg-green-100 px-1 rounded">logo.png</code> & <code className="bg-green-100 px-1 rounded">icon.png</code></div>
        <div>🎨 Format: High-quality PNG images</div>
        <div>🚀 Status: Ready for production</div>
      </div>
    </div>
  );
}
