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

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto sign in happens if email confirmation is disabled, otherwise check email
        alert('Check your email for the confirmation link!');
        onClose();
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-[#fafafa] dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-fade-in-up">
        
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
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
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
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
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
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
