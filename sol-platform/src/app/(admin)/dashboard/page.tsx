'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const supabase = createClient();
  
  // State for our live statistics
  const [stats, setStats] = useState({
    available: 0,
    applications: 0,
    adoptions: 0,
    donations: 48000 // Keeping this static until we build the donations module
  });

  // State for our recent applications table
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Get total Available Animals (Using lowercase 'available' to match your ENUM)
      const { count: availableCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('adoption_status', 'available');

      // 2. Get Pending Applications (Submitted or Under Review)
      const { count: appsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']);

      // 3. Get Total Adoptions (Approved applications)
      const { count: adoptionsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      setStats({
        available: availableCount || 0,
        applications: appsCount || 0,
        adoptions: adoptionsCount || 0,
        donations: 48000
      });

      // 4. Fetch the 3 most recent applications for the mini-table
      const { data: recent } = await supabase
        .from('applications')
        .select(`
          application_id,
          status,
          application_date,
          adopters ( full_name ),
          animals ( name )
        `)
        .order('application_date', { ascending: false })
        .limit(3);

      if (recent) setRecentApps(recent);
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-sol-dark font-bold">Dashboard</h1>
          <p className="text-xs text-sol-dark/50 mt-1">Live Shelter Overview</p>
        </div>
        <Link 
          href="/animals/new" 
          className="bg-sol-yellow text-sol-dark px-4 py-2 rounded-full text-xs font-bold hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-1"
        >
          <i className="ti ti-plus text-sm"></i> Add animal
        </Link>
      </div>

      {/* LIVE KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Animals', value: stats.available, trend: 'Current', highlight: true },
          { label: 'Pending Apps', value: stats.applications, trend: 'Needs review', highlight: false },
          { label: 'Total Adoptions', value: stats.adoptions, trend: 'All time', highlight: false },
          { label: 'Donations', value: `₱${(stats.donations / 1000)}k`, trend: '+₱12k this month', highlight: false },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl p-4 border ${stat.highlight ? 'bg-sol-yellow border-sol-yellow' : 'bg-white border-sol-dark/10 shadow-sm'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${stat.highlight ? 'text-sol-dark/60' : 'text-sol-dark/50'}`}>
              {stat.label}
            </p>
            <p className="font-serif text-3xl font-bold text-sol-dark">{stat.value}</p>
            <p className={`text-[10px] mt-1 ${stat.highlight ? 'text-sol-dark/60' : 'text-sol-dark/40'}`}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LIVE Recent Applications */}
        <div className="bg-white rounded-xl border border-sol-dark/10 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-sol-dark">Recent applications</span>
            <Link href="/applications" className="text-xs text-sol-dark/50 hover:text-sol-dark cursor-pointer">View all &rarr;</Link>
          </div>
          
          <div className="space-y-1">
            {recentApps.length === 0 ? (
              <div className="text-xs text-sol-dark/50 py-4 text-center">No applications found.</div>
            ) : (
              recentApps.map((app) => (
                <div key={app.application_id} className="flex items-center gap-3 py-3 border-b border-sol-dark/5 last:border-0">
                  <div className="w-8 h-8 bg-sol-yellow rounded-full flex items-center justify-center text-xs font-bold text-sol-dark shrink-0">
                    {app.adopters?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-sol-dark truncate">{app.adopters?.full_name}</div>
                    <div className="text-[10px] text-sol-dark/50">for {app.animals?.name}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                    app.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' :
                    app.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status === 'submitted' ? 'New' : app.status === 'under_review' ? 'In review' : app.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Static Upcoming Due Dates */}
        <div className="bg-white rounded-xl border border-sol-dark/10 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-sol-dark">Upcoming due dates</span>
            <span className="text-xs text-sol-dark/50 hover:text-sol-dark cursor-pointer">View all &rarr;</span>
          </div>
          
          <div className="space-y-1">
            {[
              { pet: 'Luna', task: 'Vaccination', date: 'May 28', urgent: true },
              { pet: 'Mochi', task: 'Deworming', date: 'Jun 2', urgent: false }
            ].map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-sol-dark/5 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.urgent ? 'bg-amber-100' : 'bg-sol-dark/5'}`}>
                  <i className={`ti ti-calendar text-sm ${task.urgent ? 'text-amber-800' : 'text-sol-dark/40'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-sol-dark">{task.pet} &middot; {task.task}</div>
                  <div className="text-[10px] text-sol-dark/50">{task.date}</div>
                </div>
                {task.urgent && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}