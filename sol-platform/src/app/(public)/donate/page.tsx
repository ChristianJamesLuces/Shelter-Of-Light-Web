'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DonatePage() {
  const [activeMethod, setActiveMethod] = useState<'gcash' | 'maya' | 'paypal' | 'bdo'>('gcash');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'gcash' || hash === 'maya' || hash === 'paypal' || hash === 'bdo') {
      setActiveMethod(hash);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-sol-dark mb-4">
          Help Us Save More Lives
        </h1>
        <p className="text-lg text-sol-dark/70 max-w-2xl mx-auto">
          Shelter of Light relies on the generosity of animal lovers like you. 
          Every donation goes directly toward food, shelter, and medical care for our rescues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* LEFT COLUMN: The Impact */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-sol-dark/10 shadow-sm">
            <h2 className="text-2xl font-bold text-sol-dark mb-6">Where your money goes</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-sol-yellow/20 flex items-center justify-center text-sol-dark shrink-0">
                  <i className="ti ti-bone text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sol-dark text-lg">Daily Meals & Nutrition</h3>
                  <p className="text-sm text-sol-dark/70 mt-1">Providing high-quality kibble, wet food, and specialized diets for recovering animals.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-sol-yellow/20 flex items-center justify-center text-sol-dark shrink-0">
                  <i className="ti ti-vaccine text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sol-dark text-lg">Veterinary Care</h3>
                  <p className="text-sm text-sol-dark/70 mt-1">Funding vaccinations, deworming, spay/neuter procedures, and emergency surgeries.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-sol-yellow/20 flex items-center justify-center text-sol-dark shrink-0">
                  <i className="ti ti-home-heart text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sol-dark text-lg">Shelter Maintenance</h3>
                  <p className="text-sm text-sol-dark/70 mt-1">Keeping our facilities clean, safe, and comfortable for all sanctuary residents.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sol-dark text-sol-cream p-8 rounded-2xl shadow-sm text-center">
            <h3 className="font-serif text-2xl font-bold mb-2">Prefer to adopt?</h3>
            <p className="text-sm text-white/70 mb-6">Give an animal the ultimate gift: a forever home.</p>
            <Link 
              href="/adopt"
              className="inline-block bg-sol-yellow text-sol-dark px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
            >
              Meet our Animals
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: The Interactive QR & Bank Tabs */}
        <div className="bg-white p-8 rounded-2xl border border-sol-dark/10 shadow-lg sticky top-24">
          <h2 className="text-2xl font-bold text-sol-dark mb-2 text-center">Send your Support</h2>
          <p className="text-sm text-sol-dark/60 text-center mb-8">
            Select your preferred platform below.
          </p>

          {/* THE TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 bg-[#f8f7f2] p-1.5 rounded-xl border border-sol-dark/5">
            <button 
              onClick={() => setActiveMethod('gcash')} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeMethod === 'gcash' ? 'bg-sol-dark text-sol-yellow shadow-md' : 'text-sol-dark/50 hover:bg-white hover:text-sol-dark'
              }`}
            >
              GCash
            </button>
            <button 
              onClick={() => setActiveMethod('maya')} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeMethod === 'maya' ? 'bg-sol-dark text-sol-yellow shadow-md' : 'text-sol-dark/50 hover:bg-white hover:text-sol-dark'
              }`}
            >
              Maya
            </button>
            <button 
              onClick={() => setActiveMethod('paypal')} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeMethod === 'paypal' ? 'bg-sol-dark text-sol-yellow shadow-md' : 'text-sol-dark/50 hover:bg-white hover:text-sol-dark'
              }`}
            >
              PayPal
            </button>
            <button 
              onClick={() => setActiveMethod('bdo')} 
              className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeMethod === 'bdo' ? 'bg-sol-dark text-sol-yellow shadow-md' : 'text-sol-dark/50 hover:bg-white hover:text-sol-dark'
              }`}
            >
              BDO
            </button>
          </div>

          {/* THE ACCOUNT DETAILS DISPLAY */}
          <div className="bg-[#f8f7f2] p-8 rounded-xl border border-sol-dark/5 flex flex-col items-center justify-center min-h-[360px]">
            
            {/* GCASH DETAILS */}
            {activeMethod === 'gcash' && (
              <div className="text-center animate-fade-in w-full">
                <img src="/g-cash-qr.jpg" alt="GCash QR Code" className="max-w-[200px] h-auto rounded-lg shadow-sm mb-6 mx-auto" />
                <div className="bg-white border border-sol-dark/10 p-4 rounded-xl inline-block text-left w-full max-w-[240px] shadow-sm">
                  <div className="mb-2">
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-0.5">Account Name</span>
                    <span className="font-medium text-sol-dark text-sm">Rosemarie A.</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-0.5">GCash Number</span>
                    <span className="font-mono font-bold tracking-widest text-sol-dark text-base">0977 211 9959</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* MAYA DETAILS */}
            {activeMethod === 'maya' && (
              <div className="text-center animate-fade-in w-full">
                <img src="/maya-qr.jpg" alt="Maya QR Code" className="max-w-[200px] h-auto rounded-lg shadow-sm mb-6 mx-auto" />
                <div className="bg-white border border-sol-dark/10 p-4 rounded-xl inline-block text-left w-full max-w-[240px] shadow-sm">
                  <div className="mb-2">
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-0.5">Account Name</span>
                    <span className="font-medium text-sol-dark text-sm">Rosemarie A.</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-0.5">Maya Number</span>
                    <span className="font-mono font-bold tracking-widest text-sol-dark text-base">0977 211 9959</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* PAYPAL DETAILS */}
            {activeMethod === 'paypal' && (
              <div className="text-center animate-fade-in w-full">
                <img src="/paypal-qr.jpg" alt="PayPal QR Code" className="max-w-[200px] h-auto rounded-lg shadow-sm mb-6 mx-auto" />
                <div className="bg-white border border-sol-dark/10 p-4 rounded-xl inline-block text-left w-full max-w-[240px] shadow-sm">
                  <div className="mb-3 border-b border-sol-dark/10 pb-3">
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-1">PayPal Email</span>
                    <span className="font-medium text-sol-dark text-sm break-all">0914@gmail.com</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-1">PayPal Username</span>
                    <span className="font-mono text-sol-dark font-bold text-sm">@rosemarieaquino</span>
                  </div>
                </div>
              </div>
            )}

            {/* BDO BANK TRANSFER LAYOUT */}
            {activeMethod === 'bdo' && (
              <div className="text-center animate-fade-in w-full py-6">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-inner">
                  <i className="ti ti-building-bank text-3xl"></i>
                </div>
                <h3 className="font-serif text-2xl font-bold text-blue-900 mb-6">BDO Unibank</h3>
                
                <div className="bg-white border border-sol-dark/10 p-5 rounded-xl inline-block text-left w-full max-w-[260px] shadow-sm">
                  <div className="mb-1">
                    <span className="block text-[10px] uppercase font-bold text-sol-dark/40 tracking-wider mb-1">Account Number</span>
                    <span className="font-mono text-sol-dark text-lg font-bold tracking-widest">0010 5027 5614</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="mt-8 text-center border-t border-sol-dark/10 pt-6">
            <p className="text-xs text-sol-dark/50 uppercase tracking-widest font-bold mb-2">Thank you for your kindness!</p>
            <p className="text-sm text-sol-dark/80">
              If you require an official acknowledgment receipt for your donation, please email us a screenshot of your transaction.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}