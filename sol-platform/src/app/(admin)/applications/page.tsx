'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ApplicationsPipelinePage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('v_application_inbox')
      .select('*')
      .order('application_date', { ascending: false });

    if (data) setApplications(data);
    if (error) console.error("Error fetching applications:", error);
    setIsLoading(false);
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to permanently delete this application? This action cannot be undone.')) return;
    setIsUpdating(true);
    const { error } = await supabase.from('applications').delete().eq('application_id', appId);
    if (error) {
      alert(`Error deleting application: ${error.message}`);
    } else {
      setApplications(apps => apps.filter(app => app.application_id !== appId));
    }
    setIsUpdating(false);
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setIsUpdating(true);
    const currentApp = applications.find(a => a.application_id === appId);
    
    if (newStatus === 'approved') {
      const { data: appData } = await supabase.from('applications').select('animal_id, adopter_id').eq('application_id', appId).single();
      
      if (appData?.animal_id) {
        // 1. Insert into Adoptions FIRST
        const { error: adoptionError } = await supabase.from('adoptions').insert({
          application_id: parseInt(appId),
          animal_id: parseInt(appData.animal_id),
          adopter_id: parseInt(appData.adopter_id),
          adoption_date: new Date().toISOString().split('T')[0]
        });

        if (adoptionError) {
          alert(`Database rejected adoption record: ${adoptionError.message}`);
          setIsUpdating(false);
          return; 
        }

        // 2. Only if successful, mark animal as adopted
        await supabase.from('animals').update({ adoption_status: 'adopted' }).eq('animal_id', appData.animal_id);
      }
    } else if (currentApp?.status === 'approved' && newStatus !== 'approved') {
      const { data: appData } = await supabase.from('applications').select('animal_id, adopter_id').eq('application_id', appId).single();
      if (appData?.animal_id) {
        await supabase.from('animals').update({ adoption_status: 'available' }).eq('animal_id', appData.animal_id);
        await supabase.from('adoptions').delete().eq('application_id', appId);
      }
    }

    // Update Application Status
    const { error: appError } = await supabase.from('applications').update({ status: newStatus }).eq('application_id', appId);
    if (appError) {
      alert(`Database Error: ${appError.message}`);
      setIsUpdating(false);
      return;
    }

    setApplications(apps => apps.map(app => app.application_id === appId ? { ...app, status: newStatus } : app));
    setIsUpdating(false);
  };

  const filteredApps = applications.filter(app => {
    const searchLower = searchQuery.toLowerCase();
    const adopterMatch = (app.adopter_name || '').toLowerCase().includes(searchLower);
    const animalMatch = (app.animal_name || '').toLowerCase().includes(searchLower);
    return adopterMatch || animalMatch;
  });

  const getAppsByStatus = (status: string) => filteredApps.filter(app => app.status?.toLowerCase() === status);

  const columns = [
    { id: 'submitted', title: '1. Form Review', description: 'Reviewing initial application details.', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', prevStatus: null, nextStatus: 'interview', nextLabel: 'Pass Form \u2192' },
    { id: 'interview', title: '2. Interview', description: 'Video call & virtual home tour phase.', color: 'bg-blue-100 text-blue-800 border-blue-200', prevStatus: 'submitted', nextStatus: 'handover', nextLabel: 'Pass Interview \u2192' },
    { id: 'handover', title: '3. Handover', description: 'Signing contract & arranging pickup.', color: 'bg-purple-100 text-purple-800 border-purple-200', prevStatus: 'interview', nextStatus: 'approved', nextLabel: 'Complete!' }
  ];

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-[1600px] mx-auto font-sans h-screen flex flex-col overflow-hidden">
      
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 sm:gap-4 shrink-0">
        <div>
          {/* UPDATED: Changed from Adoption Pipeline to Adoption Tracker */}
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-sol-dark mb-1 sm:mb-2">Adoption Tracker</h1>
          <p className="text-sol-dark/60 text-xs sm:text-sm">Track and manage applicants through the 3-step adoption process.</p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <i className="ti ti-search absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-sol-dark/40 text-xs sm:text-base"></i>
            <input type="text" placeholder="Search applicant or animal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-7 sm:pl-9 pr-2 sm:pr-4 py-2 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none shadow-sm"/>
          </div>
          <button onClick={fetchApplications} disabled={isLoading || isUpdating} className="text-[10px] sm:text-sm font-bold bg-white border border-sol-dark/10 text-sol-dark hover:bg-sol-cream px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 sm:gap-2 shadow-sm disabled:opacity-50">
            <i className={`ti ti-refresh text-sm sm:text-lg ${isLoading ? 'animate-spin' : ''}`}></i> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-sol-dark/50"><i className="ti ti-loader animate-spin text-4xl mb-3 block text-sol-yellow"></i></div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-8 pr-1 sm:pr-2 space-y-4 sm:space-y-8">
          
          {/* Completed & Archived Section */}
          <div>
            <h2 className="font-serif font-bold text-sol-dark text-base sm:text-xl border-b border-sol-dark/10 pb-1 sm:pb-2 mb-2 sm:mb-4">Completed & Archived</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 h-[180px] sm:h-[220px]">
              
              <div className="bg-white rounded-xl sm:rounded-2xl border border-green-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-2 sm:p-3 border-b border-green-100 bg-green-50 shrink-0">
                  <h2 className="font-bold text-green-800 flex justify-between items-center text-xs sm:text-sm">
                    Successfully Adopted <span className="text-[9px] sm:text-xs font-bold bg-green-200 text-green-800 px-1.5 sm:px-2 py-0.5 rounded-full">{getAppsByStatus('approved').length}</span>
                  </h2>
                </div>
                <div className="p-2 sm:p-3 overflow-y-auto flex-1 space-y-2 bg-green-50/30">
                  {getAppsByStatus('approved').map(app => (
                    <div key={app.application_id} className="bg-white p-2 sm:p-3 rounded-lg border border-green-100 flex justify-between items-center group">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-[10px] sm:text-xs text-sol-dark truncate">{app.adopter_name || 'Unknown'}</div>
                        <div className="text-[8px] sm:text-[10px] text-sol-dark/50 truncate">Adopted {app.animal_name}</div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                         <button onClick={() => updateStatus(app.application_id, 'handover')} className="text-[8px] sm:text-[10px] text-green-800/50 hover:text-green-800 underline font-bold lg:opacity-0 group-hover:opacity-100 transition-opacity">Revert</button>
                         <Link href={`/applications/${app.application_id}`} className="text-green-600/50 hover:text-green-600 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="View Application"><i className="ti ti-external-link text-xs sm:text-base"></i></Link>
                         <button onClick={() => deleteApplication(app.application_id)} className="text-red-600/50 hover:text-red-600 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Application"><i className="ti ti-trash text-xs sm:text-base"></i></button>
                         <i className="ti ti-check text-green-500 text-xs sm:text-base ml-1"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-red-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-2 sm:p-3 border-b border-red-50 bg-red-50 shrink-0">
                  <h2 className="font-bold text-red-800 flex justify-between items-center text-xs sm:text-sm">
                    Rejected Applications <span className="text-[9px] sm:text-xs font-bold bg-red-100 text-red-800 px-1.5 sm:px-2 py-0.5 rounded-full">{getAppsByStatus('rejected').length}</span>
                  </h2>
                </div>
                <div className="p-2 sm:p-3 overflow-y-auto flex-1 space-y-2 bg-red-50/30">
                  {getAppsByStatus('rejected').map(app => (
                    <div key={app.application_id} className="bg-white p-2 sm:p-3 rounded-lg border border-red-100 flex justify-between items-center opacity-70 group">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-[10px] sm:text-xs text-sol-dark truncate">{app.adopter_name || 'Unknown'}</div>
                        <div className="text-[8px] sm:text-[10px] text-sol-dark/50 truncate">Applied for {app.animal_name}</div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                        <Link href={`/applications/${app.application_id}`} className="text-red-600/50 hover:text-red-600 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="View Application"><i className="ti ti-external-link text-xs sm:text-base"></i></Link>
                        <button onClick={() => deleteApplication(app.application_id)} className="text-red-600/50 hover:text-red-600 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Application"><i className="ti ti-trash text-xs sm:text-base"></i></button>
                        <button onClick={() => updateStatus(app.application_id, 'submitted')} className="text-[8px] sm:text-[10px] text-sol-dark/50 hover:text-sol-dark underline font-bold ml-1">Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Active Applications Section */}
          <div>
            {/* UPDATED: Changed from Active Pipeline to Active Applications */}
            <h2 className="font-serif font-bold text-sol-dark text-base sm:text-xl border-b border-sol-dark/10 pb-1 sm:pb-2 mb-2 sm:mb-4">Active Applications</h2>
            
            <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-6 h-[400px] sm:h-[500px] items-start w-full">
              {columns.map((col) => (
                
                <div key={col.id} className="w-full bg-white rounded-lg sm:rounded-2xl border border-sol-dark/10 flex flex-col h-full shadow-sm">
                  
                  <div className="p-2 sm:p-4 border-b border-sol-dark/5 bg-[#f8f7f2] rounded-t-lg sm:rounded-t-2xl shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-0 sm:mb-1 gap-1">
                      <h2 className="font-bold text-sol-dark text-[9px] sm:text-sm lg:text-base leading-tight truncate w-full">{col.title}</h2>
                      <span className="text-[7px] sm:text-xs font-bold bg-sol-dark/10 text-sol-dark px-1.5 sm:px-2 py-0.5 rounded-full self-start sm:self-auto">{getAppsByStatus(col.id).length}</span>
                    </div>
                    <p className="hidden md:block text-[10px] text-sol-dark/50 font-medium leading-snug mt-1">{col.description}</p>
                  </div>
                  
                  <div className="p-1.5 sm:p-3 overflow-y-auto flex-1 space-y-1.5 sm:space-y-3 bg-sol-cream/20">
                    {getAppsByStatus(col.id).map(app => (
                      <div key={app.application_id} className="bg-white p-2 sm:p-4 rounded-md sm:rounded-xl border border-sol-dark/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                        
                        <div className="flex justify-between items-start mb-1 sm:mb-2 gap-1">
                          <h3 className="font-bold text-sol-dark text-[9px] sm:text-sm truncate w-full" title={app.adopter_name}>{app.adopter_name || 'Unknown Applicant'}</h3>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <Link href={`/applications/${app.application_id}`} className="text-sol-dark/30 hover:text-sol-yellow transition-colors" title="View Full Application"><i className="ti ti-external-link text-[10px] sm:text-base"></i></Link>
                            <button onClick={() => deleteApplication(app.application_id)} className="text-sol-dark/30 hover:text-red-500 transition-colors" title="Delete Application"><i className="ti ti-trash text-[10px] sm:text-base"></i></button>
                          </div>
                        </div>
                        
                        <div className="text-[8px] sm:text-xs text-sol-dark/70 mb-1 sm:mb-4 flex items-center gap-1 sm:gap-1.5 font-medium truncate w-full">
                          <i className="ti ti-paw text-sol-yellow shrink-0"></i> 
                          <span className="truncate">For: <span className="font-bold">{app.animal_name || 'Unknown Animal'}</span></span>
                        </div>
                        
                        {/* ---------------------------------------------------- */}
                        {/* UPDATED BUTTON LAYOUT FIX: Passed & Reject scaling   */}
                        {/* ---------------------------------------------------- */}
                        <div className="flex flex-col xl:flex-row gap-1 sm:gap-2 mt-auto pt-1.5 sm:pt-3 border-t border-sol-dark/5">
                          
                          {/* Left Controls (Back & Reject) */}
                          <div className="flex gap-1 sm:gap-2 w-full xl:w-auto xl:flex-1">
                            {col.prevStatus && (
                              <button onClick={() => updateStatus(app.application_id, col.prevStatus)} disabled={isUpdating} className="px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-sol-dark/30 hover:text-sol-dark hover:bg-sol-dark/5 transition-colors disabled:opacity-50 shrink-0" title="Move Backwards">
                                <i className="ti ti-arrow-left font-bold text-[8px] sm:text-sm"></i>
                              </button>
                            )}
                            <button onClick={() => updateStatus(app.application_id, 'rejected')} disabled={isUpdating} className="px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[7px] sm:text-[10px] font-bold text-sol-dark/40 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex-1">
                              Reject
                            </button>
                          </div>

                          {/* Right Controls (Pass / Next Phase) */}
                          <button onClick={() => updateStatus(app.application_id, col.nextStatus)} disabled={isUpdating} className={`w-full xl:w-auto px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[7px] sm:text-[10px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 border shrink-0 whitespace-nowrap ${col.color}`}>
                            {col.nextLabel}
                          </button>
                        </div>
                        {/* ---------------------------------------------------- */}

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}