'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        adopters (*),
        animals (
          *,
          animal_photos(file_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
    } else if (data) {
      setApplications(data);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [supabase]);

  // Filter Logic
  const filteredApps = applications.filter(app => {
    // 1. Check Status Filter
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    // 2. Check Search Term (searches adopter name, email, and animal name safely)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (app.adopters?.full_name || '').toLowerCase().includes(searchLower) ||
      (app.adopters?.email || '').toLowerCase().includes(searchLower) ||
      (app.animals?.name || '').toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return <div className="p-12 text-center text-sol-dark/50 font-medium">Loading applications...</div>;
  }

  // Helper function to color-code the statuses
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Approved</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Rejected</span>;
      case 'interview': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Interview</span>;
      case 'under_review': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Reviewing</span>;
      default: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">New</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Restored Header Section with Filters */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-sol-dark mb-1">Applications</h1>
          <p className="text-sol-dark/60 text-sm">{filteredApps.length} total applications</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sol-dark/40"></i>
            <input
              type="text"
              placeholder="Search applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-sol-dark/10 text-sm focus:outline-none focus:border-sol-yellow bg-white w-64 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-sol-dark/10 text-sm focus:outline-none focus:border-sol-yellow bg-white shadow-sm appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[right_12px_center]"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">New / Submitted</option>
            <option value="under_review">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Refresh Data Button */}
          <button
            onClick={fetchApplications}
            disabled={isRefreshing}
            className="bg-sol-dark text-sol-yellow px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
          >
            <i className={`ti ti-refresh ${isRefreshing ? 'animate-spin' : ''}`}></i>
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-sol-dark/10 p-16 text-center">
          <div className="w-16 h-16 bg-sol-cream text-sol-yellow rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-file-x text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-sol-dark mb-2">No Applications Found</h3>
          <p className="text-sol-dark/60 text-sm max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' 
              ? "No applications match your current filters. Try adjusting your search." 
              : "There are currently no adoption applications in the system."}
          </p>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white rounded-xl shadow-sm border border-sol-dark/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f7f2] text-sol-dark/60 font-bold uppercase tracking-wider text-[10px] border-b border-sol-dark/10">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Animal</th>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {filteredApps.map((app) => {
                  
                  // Safe extraction just in case an animal or adopter was deleted
                  const animalName = app.animals?.name || 'Unknown (Deleted)';
                  const animalSpecies = app.animals?.species || 'N/A';
                  const animalPhotoUrl = app.animals?.animal_photos?.[0]?.file_url;
                  
                  const adopterName = app.adopters?.full_name || 'Unknown Applicant';
                  const adopterEmail = app.adopters?.email || 'No email';

                  return (
                    <tr key={app.application_id} className="hover:bg-sol-cream/30 transition-colors">
                      
                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Animal Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-sol-dark/5 overflow-hidden shrink-0 border border-sol-dark/10 flex items-center justify-center">
                            {animalPhotoUrl ? (
                              <img src={animalPhotoUrl} alt={animalName} className="w-full h-full object-cover" />
                            ) : (
                              <i className="ti ti-paw text-sol-dark/20"></i>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sol-dark">{animalName}</div>
                            <div className="text-[11px] text-sol-dark/50 capitalize font-medium">{animalSpecies}</div>
                          </div>
                        </div>
                      </td>

                      {/* Adopter Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sol-dark">{adopterName}</div>
                        <div className="text-xs text-sol-dark/60 truncate max-w-[150px]" title={adopterEmail}>{adopterEmail}</div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4">
                        <div className="text-sol-dark font-medium">
                          {new Date(app.created_at || app.application_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/applications/${app.application_id}`}
                          className="inline-flex items-center justify-center gap-2 bg-sol-cream hover:bg-sol-yellow/20 text-sol-dark px-3 py-1.5 rounded-md text-xs font-bold transition-colors border border-sol-dark/5"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}