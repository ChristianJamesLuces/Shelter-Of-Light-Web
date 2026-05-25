'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Tells us which page we are currently on

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ti-layout-dashboard' },
    { name: 'Animal Inventory', href: '/animals', icon: 'ti-paw' },
    { name: 'Add Animal', href: '/animals/new', icon: 'ti-circle-plus' },
    // You can add Applications and Settings here later!
  ];

  return (
    <>
      {/* MOBILE TOP BAR (Only visible on small screens) */}
      <div className="md:hidden bg-sol-dark text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-serif font-bold text-sol-yellow text-lg">Shelter of Light</div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white hover:text-sol-yellow transition-colors"
        >
          <i className={`ti ${isOpen ? 'ti-x' : 'ti-menu-2'} text-2xl`}></i>
        </button>
      </div>

      {/* BACKDROP FOR MOBILE MENU (Darkens screen when open) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Hidden on left for mobile, fixed on left for desktop) */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-sol-dark text-white z-50 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen md:shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="font-serif font-bold text-sol-yellow text-2xl mb-1">Shelter of Light</div>
          <div className="text-[10px] uppercase tracking-widest text-white/50 mb-8">Admin Portal</div>

          <nav className="space-y-2">
            {navLinks.map((link) => {
              // Check if the current URL matches the link to highlight it
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)} // Close mobile menu when clicked
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-sol-yellow text-sol-dark' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <i className={`ti ${link.icon} text-lg`}></i>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile at bottom of sidebar */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sol-yellow text-sol-dark flex items-center justify-center font-bold text-xs">
              R
            </div>
            <div>
              <div className="text-sm font-bold">Rosemarie</div>
              <div className="text-[10px] text-white/50">Shelter Admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}