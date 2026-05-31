'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/\d/.test(pwd)) return "Password must contain at least one number.";
    if (!/[a-zA-Z]/.test(pwd)) return "Password must contain at least one letter.";
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    // 1. FORGOT PASSWORD FLOW
    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Password reset email sent! Check your inbox for the recovery link.");
      }
    } 
    // 2. SIGN UP FLOW
    else if (isSignUp) {
      
      const validationError = validatePassword(password);
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return; 
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: fullName
          }
        }
      });

      if (authError) {
        setError(authError.message);
      } else {
        // THE FIX: Updated the success message to set expectations about Admin Approval
        setSuccessMsg("Account created successfully! Your account is currently pending. Please wait for an administrator to review and approve your access. You will receive an email once approved.");
        setIsSignUp(false); 
        setPassword(""); 
        setUsername("");
        setFullName("");
      }
    } 
    // 3. SIGN IN FLOW
    else {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password. Please try again.");
      } else if (authData.user) {
        
        const { data: profile } = await supabase
          .from('users')
          .select('is_active')
          .eq('email', email)
          .single();

        if (!profile || profile.is_active !== true) {
          await supabase.auth.signOut(); 
          setError("Access Denied: Your account is pending approval or has been removed by an Admin.");
        } else {
          router.push("/dashboard");
          router.refresh(); 
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#f8f7f2] font-sans">
      
      {/* LEFT SIDE: Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-sol-dark flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sol-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-sol-yellow/20">
            <Image src="/sol-logo.jpg" alt="Shelter of Light Logo" width={48} height={48} className="object-cover w-full h-full"/>
          </div>
          <span className="font-serif text-2xl font-bold text-sol-yellow">Shelter of Light</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-serif text-white font-bold leading-tight mb-6">
            Welcome to the <span className="text-sol-yellow">Staff Portal</span>.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Manage animal inventories, review adoption applications, and help our rescues find their forever homes.
          </p>
        </div>

        <div className="relative z-10 text-white/30 text-sm">
          &copy; {new Date().getFullYear()} Shelter of Light Rescue.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="absolute top-8 left-6 sm:left-12 lg:hidden flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-sol-dark/10">
            <Image src="/sol-logo.jpg" alt="Shelter of Light Logo" width={40} height={40} className="object-cover w-full h-full"/>
          </div>
          <span className="font-serif text-xl font-bold text-sol-dark">Shelter of Light</span>
        </div>

        <div className="w-full max-w-md my-auto pt-16 lg:pt-0">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sol-dark/5">
            
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-sol-dark mb-2">
                {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create an Account' : 'Welcome!')}
              </h2>
              <p className="text-sol-dark/50 text-sm">
                {isForgotPassword 
                  ? 'Enter your email address and we will send you a recovery link.' 
                  : (isSignUp ? 'Register as a new shelter staff member.' : 'Login to continue making a difference.')}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium mb-6 border border-red-100 flex items-start gap-3">
                <i className="ti ti-alert-circle text-lg mt-0.5"></i>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium mb-6 border border-green-100 flex items-start gap-3">
                <i className="ti ti-check text-lg mt-0.5"></i>
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              
              {!isForgotPassword && isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Full Name</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" placeholder="Juan Dela Cruz"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Username</label>
                    <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" placeholder="juandc"/>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" placeholder="name@shelteroflight.com"/>
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(true); resetMessages(); }}
                        className="text-xs text-sol-dark/40 hover:text-sol-yellow transition-colors font-medium mb-1"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  
                  {isSignUp && (
                    <p className="text-[10px] text-sol-dark/40 mb-2 font-medium">
                      Must be at least 8 characters, with 1 number and 1 letter.
                    </p>
                  )}
                  
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sol-dark/20 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all bg-[#fcfcfb]" placeholder="••••••••"/>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full bg-sol-dark text-sol-yellow py-3.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 mt-4 shadow-md flex items-center justify-center gap-2">
                {isLoading ? (
                  <><i className="ti ti-loader animate-spin"></i> Processing...</>
                ) : isForgotPassword ? (
                  'Send Recovery Email'
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  <><i className="ti ti-paw text-lg"></i> Login</>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-sol-dark/5 pt-6 text-sm text-sol-dark/60 font-medium">
              {isForgotPassword ? (
                 <button type="button" onClick={() => { setIsForgotPassword(false); resetMessages(); }} className="text-sol-dark hover:text-sol-yellow transition-colors underline decoration-2 underline-offset-4">
                  &larr; Back to Login
                </button>
              ) : isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setIsSignUp(false); resetMessages(); }} className="text-sol-dark hover:text-sol-yellow transition-colors underline decoration-2 underline-offset-4">
                    Login here
                  </button>
                </>
              ) : (
                <>
                  Don't you have an account?{' '}
                  <button type="button" onClick={() => { setIsSignUp(true); resetMessages(); }} className="text-sol-dark hover:text-sol-yellow transition-colors underline decoration-2 underline-offset-4 font-bold">
                    Sign up
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}