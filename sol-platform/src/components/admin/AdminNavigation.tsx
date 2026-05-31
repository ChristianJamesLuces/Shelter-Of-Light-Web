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
  const [userRole, setUserRole] = useState<string>('Loading Role...');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

        // Let's print exactly what the database returns to your Browser Console!
        console.log("Supabase Profile Data:", profileData);

        if (error) {
          console.error("Could not fetch profile:", error);
          setUserRole('Staff');
        } else if (profileData) {
          // THE FIX: We use Number() to guarantee it is treated as a math digit, not a string!
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

  const initials = userEmail && userEmail !== 'Loading...' && userEmail !== 'Not logged in' 
    ? userEmail.substring(0, 2).toUpperCase() 
    : '??';

  return (
    <aside className="w-[180px] bg-sol-dark p-4 shrink-0 flex flex-col h-[100vh] sticky top-0 overflow-hidden">
      
      {/* Logo Area */}
      <div className="flex items-center gap-2 mb-6 px-1 shrink-0">
        <div className="w-7 h-7 bg-sol-yellow rounded-full flex items-center justify-center shrink-0">
          <i className="ti ti-paw text-sol-dark text-sm" aria-hidden="true"></i>
        </div>
        <div>
          <div className="text-white font-medium text-xs">SoL Admin</div>
          <div className="text-white/35 text-[10px]">Staff portal</div>
        </div>
      </div>

      {/* Navigation Links */}
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

      {/* User Profile & Logout Area */}
      <div className="mt-auto pt-4 border-t border-white/10 space-y-3 shrink-0">
        
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 bg-sol-yellow rounded-full flex items-center justify-center text-[10px] font-medium text-sol-dark shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-[11px] truncate" title={userEmail || ''}>
              {userEmail}
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
  );
}