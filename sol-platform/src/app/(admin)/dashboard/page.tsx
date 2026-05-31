'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [username, setUsername] = useState('...');
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalDogs: 0,
    availableDogs: 0,
    totalCats: 0,
    availableCats: 0,
    activeApps: 0,
    successfulAdoptions: 0
  });

  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // FOOLPROOF STATUS PARSER
  const normalizeStatus = (status: string | null) => {
    if (!status) return 'available';
    const s = status.toLowerCase();
    if (s.includes('hold')) return 'on hold';
    if (s.includes('sanctuary')) return 'sanctuary resident';
    if (s.includes('adopt')) return 'adopted';
    return 'available';
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const { data: profile } = await supabase.from('users').select('username').eq('email', user.email).single();
      if (profile) setUsername(profile.username || 'User');
    }

    const { data: animals } = await supabase.from('animals').select('species, adoption_status');
    let tDogs = 0, aDogs = 0, tCats = 0, aCats = 0, adoptions = 0;

    if (animals) {
      animals.forEach(animal => {
        const species = animal.species?.toLowerCase();
        const status = normalizeStatus(animal.adoption_status);
        
        if (status === 'adopted') {
          adoptions++; 
        } else {
          if (species === 'dog') {
            tDogs++;
            if (status === 'available') aDogs++;
          } 
          else if (species === 'cat') {
            tCats++;
            if (status === 'available') aCats++;
          }
        }
      });
    }

    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('*, animals(name), adopters(*)') 
      .order('application_date', { ascending: false });

    if (appsError) {
      console.error("Database Error Fetching Applications:", appsError.message);
    }

    let activeCount = 0;
    
    if (apps) {
      activeCount = apps.filter(app => ['submitted', 'interview', 'handover'].includes(app.status?.toLowerCase())).length;
      setRecentApps(apps.slice(0, 5));
    }

    setStats({
      totalDogs: tDogs,
      availableDogs: aDogs,
      totalCats: tCats,
      availableCats: aCats,
      activeApps: activeCount,
      successfulAdoptions: adoptions
    });

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'submitted') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (s === 'interview') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'handover') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'approved') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">
          Welcome back, <span className="text-sol-yellow">@{username}</span>
        </h1>
        <p className="text-sol-dark/60 text-sm">Here is what's happening at the shelter today.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-sol-dark/50">
          <i className="ti ti-loader animate-spin text-4xl mb-3 block text-sol-yellow"></i>
        </div>
      ) : (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            
            {/* Dogs Stat (Blue Theme) */}
            <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-200 flex flex-col justify-between hover:shadow-md hover:bg-blue-100/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                  <i className="ti ti-dog text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-blue-800/60 text-xs font-bold uppercase tracking-wider mb-1">Shelter Dogs</h3>
                <div className="text-3xl font-serif font-bold text-blue-900">
                  {stats.totalDogs} <span className="text-sm font-sans font-normal text-blue-800/50">total</span>
                </div>
                <p className="text-xs text-blue-800/70 mt-2 font-medium">
                  <span className="text-blue-700 font-bold">{stats.availableDogs}</span> available for adoption
                </p>
              </div>
            </div>

            {/* Cats Stat (Orange Theme) */}
            <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-200 flex flex-col justify-between hover:shadow-md hover:bg-orange-100/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm">
                  <i className="ti ti-cat text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-orange-800/60 text-xs font-bold uppercase tracking-wider mb-1">Shelter Cats</h3>
                <div className="text-3xl font-serif font-bold text-orange-900">
                  {stats.totalCats} <span className="text-sm font-sans font-normal text-orange-800/50">total</span>
                </div>
                <p className="text-xs text-orange-800/70 mt-2 font-medium">
                  <span className="text-orange-700 font-bold">{stats.availableCats}</span> available for adoption
                </p>
              </div>
            </div>

            {/* Applications Stat (Amber/Yellow Theme) */}
            <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between hover:shadow-md hover:bg-amber-100/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-sm">
                  <i className="ti ti-file-text text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-amber-800/60 text-xs font-bold uppercase tracking-wider mb-1">Active Apps</h3>
                <div className="text-3xl font-serif font-bold text-amber-900">{stats.activeApps}</div>
                <p className="text-xs text-amber-800/70 mt-2 font-medium">
                  In the adoption pipeline
                </p>
              </div>
            </div>

            {/* Adoptions Stat (Green Theme) */}
            <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 flex flex-col justify-between hover:shadow-md hover:bg-green-100/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                  <i className="ti ti-heart text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-green-800/60 text-xs font-bold uppercase tracking-wider mb-1">Total Adoptions</h3>
                <div className="text-3xl font-serif font-bold text-green-900">{stats.successfulAdoptions}</div>
                <p className="text-xs text-green-800/70 mt-2 font-medium">
                  Forever homes found
                </p>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT - Recent Apps Full Width */}
          <div className="bg-white rounded-2xl shadow-sm border border-sol-dark/5 overflow-hidden">
            <div className="p-6 border-b border-sol-dark/5 flex justify-between items-center bg-[#fcfcfb]">
              <h2 className="font-serif font-bold text-sol-dark text-lg">Recent Applications</h2>
              <Link href="/applications" className="text-xs font-bold text-sol-dark hover:text-sol-yellow transition-colors">
                View All &rarr;
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-sol-dark/10 text-[10px] uppercase tracking-wider text-sol-dark/50 font-bold">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Animal</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sol-dark/5">
                  {recentApps.length > 0 ? (
                    recentApps.map((app) => {
                      const adopter = app.adopters || {};
                      const applicantName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || 'Unknown Applicant');

                      return (
                        <tr key={app.application_id} className="hover:bg-sol-cream/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-sol-dark">{applicantName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-sol-dark/80 font-medium flex items-center gap-2">
                              <i className="ti ti-paw text-sol-yellow"></i> {app.animals?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-sol-dark/60 font-medium">{formatDate(app.application_date || app.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(app.status)}`}>
                              {app.status === 'submitted' ? 'Form Review' : app.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sol-dark/50 text-sm">
                        <i className="ti ti-file-off text-3xl mb-2 block opacity-50"></i>
                        No active applications right now.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}