'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The new Password Security Validator
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    if (!/[a-zA-Z]/.test(pwd)) return "Password must contain at least one letter.";
    return null;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    // 2. Check password security rules
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    // 3. Save to Supabase
    const { error: supabaseError } = await supabase.auth.updateUser({
      password: password
    });

    if (supabaseError) {
      setError(supabaseError.message);
      setIsLoading(false);
    } else {
      router.push('/login?reset=success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f2] font-sans relative overflow-hidden p-6">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sol-yellow/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-sol-dark/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-sol-dark/5 relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-sol-yellow/20 mx-auto mb-5">
            <Image src="/sol-logo.jpg" alt="Shelter of Light Logo" width={64} height={64} className="object-cover w-full h-full"/>
          </div>
          <h2 className="text-2xl font-serif font-bold text-sol-dark mb-2">Secure Your Account</h2>
          <p className="text-sol-dark/50 text-sm">
            Create a strong new password to restore your access to the staff portal.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-start gap-3">
            <i className="ti ti-alert-circle text-lg mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-1">
              New Password
            </label>
            <p className="text-[10px] text-sol-dark/40 mb-2 font-medium">
              Must be at least 8 characters, with 1 number and 1 letter.
            </p>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" 
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-sol-dark text-sol-yellow py-3.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <><i className="ti ti-loader animate-spin"></i> Saving...</>
            ) : (
              <><i className="ti ti-lock"></i> Save New Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}