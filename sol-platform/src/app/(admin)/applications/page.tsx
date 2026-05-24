'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We added a function to manually refresh the data
  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        application_id,
        status,
        application_date,
        adopters ( full_name, email ),
        animals ( name )
      `)
      .order('application_date', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
    } else if (data) {
      setApplications(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header with a Refresh Button to bypass Next.js cache */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-sol-dark font-bold">Applications</h1>
          <p className="text-xs text-sol-dark/50 mt-1">
            {applications.length} total applications
          </p>
        </div>
        <button 
          onClick={fetchApplications}
          className="text-xs bg-sol-dark text-sol-yellow px-4 py-2 rounded-lg font-bold hover:bg-black transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-sol-dark/10 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-sol-dark/10 bg-[#f8f7f2]">
          {['Applicant', 'For animal', 'Date', 'Status', 'Action'].map(header => (
            <span key={header} className="text-[10px] font-bold text-sol-dark/50 uppercase tracking-wider">
              {header}
            </span>
          ))}
        </div>

        {isLoading && <div className="p-8 text-center text-sm text-sol-dark/50">Loading applications...</div>}
        
        {!isLoading && applications.length === 0 && (
          <div className="p-8 text-center text-sm text-sol-dark/50">No applications found.</div>
        )}

        {/* Live Data Rows */}
        {!isLoading && applications.map((app) => {
          const dateStr = new Date(app.application_date).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric' 
          });

          return (
            <div 
              key={app.application_id} 
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-sol-dark/5 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sol-yellow rounded-full flex items-center justify-center text-xs font-bold text-sol-dark shrink-0">
                  {app.adopters?.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-sol-dark truncate">{app.adopters?.full_name}</div>
                  <div className="text-xs text-sol-dark/40 truncate">{app.adopters?.email}</div>
                </div>
              </div>
              
              <span className="text-sm text-sol-dark font-medium">{app.animals?.name}</span>
              <span className="text-xs text-sol-dark/60">{dateStr}</span>
              
              <div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  app.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' :
                  app.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {app.status === 'submitted' ? 'New' : 
                   app.status === 'under_review' ? 'In Review' : 
                   app.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
              
              <Link 
                href={`/applications/${app.application_id}`}
                className="text-xs font-medium text-sol-dark hover:text-sol-yellow underline transition-colors"
              >
                Review &rarr;
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}