'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [userEmail, setUserEmail] = useState<string | null>('Loading...');
  const [username, setUsername] = useState<string>('Loading...');
  const [userRole, setUserRole] = useState<string>('Loading Role...');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email) {
        setUserEmail(user.email);

        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error("Could not fetch profile:", error);
          setUserRole('Staff');
          setUsername('User');
        } else if (profileData) {
          setUsername(profileData.username || 'User');

          if (Number(profileData.role_id) === 1) {
            setUserRole('Admin');
            setIsAdmin(true);
          } else {
            setUserRole('Staff');
            setIsAdmin(false);
          }
        }
      } else {
        setUserEmail('Not logged in');
        setUserRole('None');
        setUsername('Guest');
      }
    };
    
    fetchUserAndRole();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); 
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: 'ti-layout-dashboard' },
    { name: 'Animals', href: '/animals', icon: 'ti-paw' },
    { name: 'Applications', href: '/applications', icon: 'ti-file-text' },
    { name: 'Adoptions', href: '/adoptions', icon: 'ti-heart' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Manage Staff', href: '/dashboard/staff', icon: 'ti-users' });
  }

  const initials = username !== 'Loading...' && username !== 'Guest' 
    ? username.substring(0, 2).toUpperCase() 
    : '??';

  return (
    <>
      {/* TOP BAR (Visible on phones AND tablets) */}
      <div className="lg:hidden flex items-center justify-between bg-sol-dark p-4 shrink-0 shadow-md z-30">
        <div className="flex items-center gap-3">
          <img 
            src="/sol-logo.jpg" 
            alt="Shelter of Light Logo" 
            className="w-8 h-8 rounded-full object-cover border border-sol-dark/20" 
          />
          <span className="text-white font-medium text-sm">Shelter of Light</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:text-sol-yellow transition-colors p-1"
        >
          <i className="ti ti-menu-2 text-2xl"></i>
        </button>
      </div>

      {/* OVERLAY BACKGROUND */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* THE SIDEBAR (Slide-out on mobile/tablet, Fixed on Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[240px] lg:w-[200px] bg-sol-dark p-4 flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out shrink-0 shadow-2xl lg:shadow-none
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="flex items-start justify-between mb-6 px-1 shrink-0">
          <div className="flex items-center gap-2">
            <img 
              src="/sol-logo.jpg" 
              alt="Shelter of Light Logo" 
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-sol-dark/20" 
            />
            <div>
              <div className="text-white font-medium text-xs">Shelter of Light</div>
              <div className="text-white/35 text-[10px]">Management Portal</div>
            </div>
          </div>
          
          <button 
            className="lg:hidden text-white/50 hover:text-white mt-1 -mr-1" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="ti ti-x text-lg"></i>
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto mt-2 pr-1">
          {navLinks.map((link) => {
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

        <div className="mt-auto pt-4 border-t border-white/10 space-y-3 shrink-0">
          <div className="flex items-center gap-2 px-2">
            <div className="w-6 h-6 bg-sol-yellow rounded-full flex items-center justify-center text-[10px] font-medium text-sol-dark shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-[11px] truncate" title={userEmail || ''}>
                {username}
              </div>
              <div className="text-sol-yellow/80 font-bold capitalize text-[10px] truncate">
                {userRole}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors w-full cursor-pointer"
          >
            <i className="ti ti-logout text-sm"></i>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}