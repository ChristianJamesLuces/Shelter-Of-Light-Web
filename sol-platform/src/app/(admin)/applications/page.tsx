'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      application_id,
      status,
      application_date,
      adopter_id,
      animal_id
    `)
    .order('application_date', { ascending: false }); // Updated from created_at

  if (error) {
    console.error('Error fetching applications:', error);
  } else if (data) {
    setApplications(data);
  }
  setIsLoading(false);
}

    fetchApplications();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-sol-dark font-bold">Applications</h1>
          <p className="text-xs text-sol-dark/50 mt-1">
            {applications.length} total applications
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-sol-dark/10 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-sol-dark/10 bg-[#f8f7f2]">
          {['App ID', 'Adopter ID', 'Animal ID', 'Status', 'Action'].map(header => (
            <span key={header} className="text-[10px] font-bold text-sol-dark/50 uppercase tracking-wider">
              {header}
            </span>
          ))}
        </div>

        {isLoading && <div className="p-8 text-center text-sm text-sol-dark/50">Loading...</div>}
        
        {!isLoading && applications.length === 0 && (
          <div className="p-8 text-center text-sm text-sol-dark/50">No applications found.</div>
        )}

        {!isLoading && applications.map((app) => (
          <div 
            key={app.application_id} 
            className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-sol-dark/5 items-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-sol-dark truncate">{app.application_id}</span>
            <span className="text-sm text-sol-dark/60 truncate">{app.adopter_id}</span>
            <span className="text-sm text-sol-dark/60">{app.animal_id}</span>
            
            <div>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                {app.status}
              </span>
            </div>
            
            <span className="text-xs font-medium text-sol-dark hover:text-sol-yellow underline cursor-pointer transition-colors">
              Review
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}