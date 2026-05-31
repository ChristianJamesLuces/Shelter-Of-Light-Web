'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-sol-dark text-sol-cream sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO AND BRAND NAME */}
          <div className="flex-shrink-0 font-bold text-xl tracking-wider">
            <Link href="/" className="flex items-center gap-3 hover:text-sol-yellow transition-colors group">
              {/* This looks for your logo in the public folder */}
              <img 
                src="/sol-logo.jpg"   
                alt="Shelter of Light Logo" 
                className="h-10 w-10 object-cover rounded-full border-2 border-transparent group-hover:border-sol-yellow transition-colors" 
              />
              <div>
                SoL <span className="text-sm font-normal text-gray-300">| Shelter of Light</span>
              </div>
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-sol-yellow transition-colors font-medium">Home</Link>
            <Link href="/adopt" className="hover:text-sol-yellow transition-colors font-medium">Find a Companion</Link>
            <Link href="/about" className="hover:text-sol-yellow transition-colors font-medium">About Us</Link>
            <Link 
              href="/donate" 
              className="bg-sol-yellow text-sol-dark px-5 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-sm"
            >
              Donate
            </Link>
          </div>

          {/* MOBILE NAVIGATION CONTROLS */}
          <div className="md:hidden flex items-center gap-3">
            <Link 
              href="/donate" 
              className="bg-sol-yellow text-sol-dark px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-sm text-sm"
            >
              Donate
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-sol-cream hover:text-sol-yellow focus:outline-none p-1 transition-colors"
              aria-label="Toggle menu"
            >
              <i className={`ti ${isMobileMenuOpen ? 'ti-x' : 'ti-menu-2'} text-2xl block`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#2a2a2a] border-t border-white/10 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-sol-yellow hover:bg-white/5 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/adopt" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-sol-yellow hover:bg-white/5 transition-colors"
            >
              Find a Companion
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-sol-yellow hover:bg-white/5 transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}