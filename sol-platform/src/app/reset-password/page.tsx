'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // This tells Supabase to securely update the password for whoever clicked the link
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // If it works, send them back to the login page so they can use their new password
      router.push('/login?reset=success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f2] font-sans p-6">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sol-dark/5 text-center">
        
        <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-sol-yellow/20 mx-auto mb-6">
          <Image src="/sol-logo.jpg" alt="Shelter of Light Logo" width={64} height={64} className="object-cover w-full h-full"/>
        </div>

        <h2 className="text-2xl font-serif font-bold text-sol-dark mb-2">Create New Password</h2>
        <p className="text-sol-dark/50 text-sm mb-8">
          Please enter your new secure password below.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium mb-6 text-left border border-red-100 flex items-start gap-3">
            <i className="ti ti-alert-circle text-lg mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">New Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || password.length < 6} 
            className="w-full bg-sol-dark text-sol-yellow py-3.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><i className="ti ti-loader animate-spin"></i> Saving...</>
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}