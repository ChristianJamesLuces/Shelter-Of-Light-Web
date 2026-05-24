'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

    const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ti-layout-dashboard' },
    { name: 'Animals', href: '/animals', icon: 'ti-paw' },
    { name: 'Applications', href: '/applications', icon: 'ti-file-text' },
    { name: 'Adoptions', href: '/adoptions', icon: 'ti-heart' },
    { name: 'Donations', href: '/donations', icon: 'ti-cash' },
    ];
  return (
    <div className="w-[180px] bg-sol-dark p-4 shrink-0 flex flex-col min-h-screen sticky top-0">
      {/* Logo Area */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <div className="w-7 h-7 bg-sol-yellow rounded-full flex items-center justify-center shrink-0">
          <i className="ti ti-paw text-sol-dark text-sm" aria-hidden="true"></i>
        </div>
        <div>
          <div className="text-white font-medium text-xs">SoL Admin</div>
          <div className="text-white/35 text-[10px]">Staff portal</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-grow space-y-1">
        {navLinks.map((link) => {
          // Check if the current route matches the link
          const isActive = pathname.startsWith(link.href);
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-sol-yellow/15' : 'hover:bg-white/5'}`}
            >
              <i className={`ti ${link.icon} text-[15px] ${isActive ? 'text-sol-yellow' : 'text-white/40'}`} aria-hidden="true"></i>
              <span className={`text-xs ${isActive ? 'text-sol-yellow font-medium' : 'text-white/45 font-normal'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-2 px-2 py-3 border-t border-white/10 mt-4">
        <div className="w-6 h-6 bg-sol-yellow rounded-full flex items-center justify-center text-[10px] font-medium text-sol-dark shrink-0">
          RA
        </div>
        <div>
          <div className="text-white text-[11px]">Rose Aquino</div>
          <div className="text-white/35 text-[10px]">Admin</div>
        </div>
      </div>
    </div>
  );
}