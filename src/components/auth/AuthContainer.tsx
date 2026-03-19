'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { TogglePanel } from './TogglePanel';

type AuthContainerProps = {
  initialMode?: 'signin' | 'signup';
};

export function AuthContainer({ initialMode = 'signin' }: AuthContainerProps) {
  const [isActive, setIsActive] = useState(initialMode === 'signup');

  const switchToSignUp = () => {
    setIsActive(true);
    window.history.replaceState(null, '', '/auth/register');
  };

  const switchToSignIn = () => {
    setIsActive(false);
    window.history.replaceState(null, '', '/auth/login');
  };

  return (
    <div className="relative min-h-[480px] w-[768px] max-w-full overflow-hidden rounded-[30px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)]">
      {/* Sign Up Form */}
      <div
        className={cn(
          'absolute top-0 left-0 z-1 h-full w-1/2 opacity-0 transition-all duration-600 ease-in-out',
          isActive && 'z-5 translate-x-full opacity-100 animate-auth-move'
        )}
      >
        <SignUpForm />
      </div>

      {/* Sign In Form */}
      <div
        className={cn(
          'absolute top-0 left-0 z-2 h-full w-1/2 transition-all duration-600 ease-in-out',
          isActive && 'translate-x-full'
        )}
      >
        <SignInForm />
      </div>

      <TogglePanel
        isActive={isActive}
        onSignIn={switchToSignIn}
        onSignUp={switchToSignUp}
      />
    </div>
  );
}
