"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-sol-cream font-sans">
      
      {/* Left Pane - Branding (Hidden on mobile, visible on desktop) */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-sol-dark p-12 lg:flex relative overflow-hidden">
        <div className="flex flex-col items-center justify-center text-center z-10">
           
           {/* Shelter of Light Logo */}
           <div className="relative mb-8 h-56 w-56 overflow-hidden rounded-2xl border-2 border-sol-yellow/20 shadow-xl bg-white">
              <Image 
                src="/sol-logo.jpg" 
                alt="Shelter of Light Logo" 
                fill 
                className="object-contain"
                priority
              />
           </div>
           
           <h1 className="mt-4 font-serif text-3xl font-bold tracking-widest text-sol-cream uppercase">
             Shelter of Light
           </h1>
           <p className="mt-2 text-sm tracking-[0.3em] text-sol-cream/50 uppercase">
             The Light We Carry: Our Journey
           </p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-sol-dark">WELCOME!</h2>
            <p className="mt-2 text-sm text-gray-500">Login to continue making a difference</p>
          </div>

          <form className="space-y-6" action="#" method="POST">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-sol-dark">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="hello@example.com"
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-sol-dark shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sol-yellow sm:text-sm sm:leading-6 bg-white transition-shadow"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-sol-dark">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-sol-dark shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sol-yellow sm:text-sm sm:leading-6 bg-white transition-shadow"
                />
                
                {/* Toggle Password Visibility Button */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-sol-dark transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-start mt-3">
                <Link href="/forgot-password" className="text-sm font-semibold text-sol-dark hover:text-gray-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-sol-yellow px-3 py-2.5 text-sm font-semibold leading-6 text-sol-dark shadow-sm hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sol-yellow transition-all"
              >
                Log In
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold leading-6 text-sol-dark hover:text-gray-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}