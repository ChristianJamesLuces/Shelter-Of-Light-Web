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
        const status = animal.adoption_status?.toLowerCase();
        
        if (species === 'dog') {
          tDogs++;
          if (status === 'available') aDogs++;
        } 
        else if (species === 'cat') {
          tCats++;
          if (status === 'available') aCats++;
        }
        
        if (status === 'adopted') adoptions++;
      });
    }

    const { data: apps } = await supabase
      .from('applications')
      .select('*, animals(name)') 
      .order('created_at', { ascending: false });

    let activeCount = 0;
    
    if (apps) {
      activeCount = apps.filter(app => ['pending', 'under review'].includes(app.status?.toLowerCase())).length;
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            
            {/* Dogs Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sol-dark/5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <i className="ti ti-dog text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sol-dark/50 text-xs font-bold uppercase tracking-wider mb-1">Shelter Dogs</h3>
                <div className="text-3xl font-serif font-bold text-sol-dark">
                  {stats.totalDogs} <span className="text-sm font-sans font-normal text-sol-dark/40">total</span>
                </div>
                <p className="text-xs text-sol-dark/60 mt-2 font-medium">
                  <span className="text-blue-600 font-bold">{stats.availableDogs}</span> available for adoption
                </p>
              </div>
            </div>

            {/* Cats Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sol-dark/5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <i className="ti ti-cat text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sol-dark/50 text-xs font-bold uppercase tracking-wider mb-1">Shelter Cats</h3>
                <div className="text-3xl font-serif font-bold text-sol-dark">
                  {stats.totalCats} <span className="text-sm font-sans font-normal text-sol-dark/40">total</span>
                </div>
                <p className="text-xs text-sol-dark/60 mt-2 font-medium">
                  <span className="text-orange-600 font-bold">{stats.availableCats}</span> available for adoption
                </p>
              </div>
            </div>

            {/* Applications Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sol-dark/5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-sol-yellow/20 flex items-center justify-center text-sol-dark">
                  <i className="ti ti-file-text text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sol-dark/50 text-xs font-bold uppercase tracking-wider mb-1">Active Apps</h3>
                <div className="text-3xl font-serif font-bold text-sol-dark">{stats.activeApps}</div>
                <p className="text-xs text-sol-dark/60 mt-2 font-medium">
                  Pending review & approval
                </p>
              </div>
            </div>

            {/* Adoptions Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sol-dark/5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <i className="ti ti-heart text-xl"></i>
                </div>
              </div>
              <div>
                <h3 className="text-sol-dark/50 text-xs font-bold uppercase tracking-wider mb-1">Total Adoptions</h3>
                <div className="text-3xl font-serif font-bold text-sol-dark">{stats.successfulAdoptions}</div>
                <p className="text-xs text-sol-dark/60 mt-2 font-medium">
                  Forever homes found
                </p>
              </div>
            </div>

          </div>

          {/* MAIN CONTENT - Recent Apps Full Width */}
          <div className="bg-white rounded-2xl shadow-sm border border-sol-dark/5 overflow-hidden">
            <div className="p-6 border-b border-sol-dark/5 flex justify-between items-center bg-[#fcfcfb]">
              <h2 className="font-serif font-bold text-sol-dark text-lg">Recent Applications</h2>
              <Link href="/dashboard/applications" className="text-xs font-bold text-sol-dark hover:text-sol-yellow transition-colors">
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
                    recentApps.map((app) => (
                      <tr key={app.application_id} className="hover:bg-sol-cream/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-sol-dark">{app.applicant_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-sol-dark/80 font-medium">{app.animals?.name || 'Loading...'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-sol-dark/60 font-medium">{formatDate(app.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                            ${app.status?.toLowerCase() === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                            ${app.status?.toLowerCase() === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            ${app.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                            ${!['pending', 'approved', 'rejected'].includes(app.status?.toLowerCase()) ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                          `}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sol-dark/50 text-sm">
                        <i className="ti ti-file-off text-3xl mb-2 block opacity-50"></i>
                        No recent applications found.
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