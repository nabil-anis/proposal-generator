
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Define custom persistence adapters to avoid import errors from CDN
      const localPersistence = {
        getItem: (key: string) => localStorage.getItem(key),
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        removeItem: (key: string) => localStorage.removeItem(key),
      };

      const sessionPersistence = {
        getItem: (key: string) => sessionStorage.getItem(key),
        setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
        removeItem: (key: string) => sessionStorage.removeItem(key),
      };

      // Set persistence based on "Remember Me" selection
      await supabase.auth.setPersistence(
        rememberMe ? localPersistence : sessionPersistence
      );

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        
        // If Email Confirmation is disabled in Supabase, we get a session immediately.
        // In that case, auto-login the user.
        if (data.session) {
          onLoginSuccess();
          onClose();
        } else {
          // Otherwise, show the check email screen
          setShowSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setShowSuccess(false);
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      <div className="relative z-10 w-full max-w-md bg-[#fafafa] dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-fade-in-up">
        
        {/* SUCCESS STATE CARD */}
        {showSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-500 dark:text-green-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Check your inbox</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              We've sent a confirmation link to <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>.<br/>
              Please verify your email to continue.
            </p>
            <Button onClick={handleClose} className="w-full rounded-xl">
              Got it
            </Button>
            <p className="mt-4 text-xs text-gray-400">
              Can't find it? Check your spam folder.
            </p>
          </div>
        ) : (
          /* LOGIN / SIGNUP FORM */
          <>
            <div className="px-8 pt-8 pb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isSignUp ? 'Sync your training data across all your devices.' : 'Sign in to access your saved training data.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="px-8 pb-8 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group cursor-pointer outline-none"
                >
                  <div className={`
                    w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200
                    ${rememberMe 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-white dark:bg-white/10 border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                    }
                  `}>
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 select-none">Remember me</span>
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isLoading} className="w-full rounded-xl">
                  {isSignUp ? 'Sign Up' : 'Log In'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 text-blue-500 hover:text-blue-600 font-medium"
                >
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </button>
              </div>
            </form>
            
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
