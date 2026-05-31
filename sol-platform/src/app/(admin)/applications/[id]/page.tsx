'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendStatusEmail } from '@/app/actions/email'; 

export default function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter(); 
  
  const [appData, setAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('submitted');

  useEffect(() => {
    async function fetchApplicationDetails() {
      const { data, error } = await supabase
        .from('applications')
        .select(`*, adopters (*), animals (*, animal_photos(file_url))`)
        .eq('application_id', params.id)
        .single();

      if (data) {
        setAppData(data);
        setTargetStatus(data.status); 
      }
      setIsLoading(false);
    }
    fetchApplicationDetails();
  }, [params.id, supabase]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!newStatus) return;
    setIsUpdating(true);
    
    const { error: appError } = await supabase.from('applications').update({ status: newStatus }).eq('application_id', params.id);

    if (!appError) {
      // SMART ADOPTION SYNC LOGIC
      if (newStatus === 'approved' && appData.animals?.animal_id) {
        // 1. Mark animal as adopted
        await supabase.from('animals').update({ adoption_status: 'adopted' }).eq('animal_id', appData.animals.animal_id);
        
        // 2. Insert into the Adoptions table (matching your exact schema)
        await supabase.from('adoptions').insert({
          application_id: params.id,
          animal_id: appData.animals.animal_id,
          adopter_id: appData.adopter_id,
          adoption_date: new Date().toISOString().split('T')[0] // Formats as YYYY-MM-DD
        });

      } else if (appData.status === 'approved' && newStatus !== 'approved' && appData.animals?.animal_id) {
        // Revert animal status and delete from adoptions table
        await supabase.from('animals').update({ adoption_status: 'available' }).eq('animal_id', appData.animals.animal_id);
        await supabase.from('adoptions').delete().eq('application_id', params.id);
      }

      try {
        if (['approved', 'rejected', 'interview'].includes(newStatus) && appData.adopters?.email) {
            const fullName = appData.adopters.first_name ? `${appData.adopters.first_name} ${appData.adopters.last_name}` : (appData.adopters.full_name || 'Adopter');
            await sendStatusEmail(appData.adopters.email, fullName, appData.animals?.name || 'the animal', newStatus);
        }
      } catch (err) {
        console.warn("Email limits hit or failed.", err);
      }

      setAppData({ ...appData, status: newStatus });
      setTargetStatus(newStatus);
    } else {
      alert("Failed to update status.");
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this application? This action cannot be undone.`)) return;
    setIsUpdating(true);
    try {
      await supabase.from('applications').delete().eq('application_id', params.id);
      if (appData.adopter_id) await supabase.from('adopters').delete().eq('adopter_id', appData.adopter_id);
      router.push('/applications');
      router.refresh();
    } catch (error: any) {
      alert(`Error deleting data: ${error.message || error}`);
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-sol-dark/50"><i className="ti ti-loader animate-spin text-4xl mb-3 block text-sol-yellow"></i> Loading details...</div>;
  if (!appData) return <div className="p-12 text-center"><h2 className="text-2xl font-bold mb-4">Application Not Found</h2><Link href="/applications" className="text-sol-yellow hover:underline">&larr; Back to Pipeline</Link></div>;

  const adopter = appData.adopters || {};
  const animal = appData.animals || {};
  const animalPhotoUrl = animal.animal_photos?.[0]?.file_url;
  const adopterName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || 'Unknown Adopter');

  const getStatusText = (status: string) => {
    if (status === 'submitted') return '1. Form Review';
    if (status === 'interview') return '2. Interview Phase';
    if (status === 'handover') return '3. Handover Process';
    return status;
  };

  const getPreviousStatus = (currentStatus: string) => {
    if (currentStatus === 'interview') return 'submitted';
    if (currentStatus === 'handover') return 'interview';
    return null;
  };

  const prevStatus = getPreviousStatus(appData.status);

  return (
    <div className="max-w-5xl mx-auto pb-12 p-4 sm:p-8 font-sans">
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/applications" className="text-sm font-bold text-sol-dark/50 hover:text-sol-dark transition-colors inline-block">&larr; Back to Pipeline</Link>
          <button onClick={handleDelete} disabled={isUpdating} className="text-xs bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"><i className="ti ti-trash"></i> Delete Application</button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-sol-dark">Application Review</h1>
            <p className="text-sol-dark/60 mt-1">Submitted on {new Date(appData.application_date || appData.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="bg-white border border-sol-dark/10 px-6 py-3 rounded-xl shadow-sm text-center min-w-[150px]">
            <div className="text-[10px] uppercase tracking-widest text-sol-dark/40 font-bold mb-1">Current Status</div>
            <div className={`font-bold capitalize ${appData.status === 'approved' ? 'text-green-600' : appData.status === 'rejected' ? 'text-red-600' : appData.status === 'handover' ? 'text-purple-600' : appData.status === 'interview' ? 'text-blue-600' : 'text-amber-600'}`}>
              {getStatusText(appData.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <div className="flex items-center justify-between border-b border-sol-dark/5 pb-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sol-yellow/20 flex items-center justify-center text-sol-dark"><i className="ti ti-user text-lg"></i></div>
                    <h2 className="text-lg font-bold text-sol-dark">Applicant Profile</h2>
                </div>
                {adopter.fb_link && (
                  <a href={adopter.fb_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    <i className="ti ti-brand-facebook text-lg"></i> Contact via FB
                  </a>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Full Name</span> <span className="font-medium text-sol-dark">{adopterName}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Age</span> <span className="font-medium text-sol-dark">{adopter.age ? `${adopter.age} years old` : 'N/A'}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Email</span> <span className="font-medium text-sol-dark">{adopter.email || 'N/A'}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Phone</span> <span className="font-medium text-sol-dark">{adopter.phone || 'N/A'}</span></div>
              <div className="col-span-2"><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">FB / Messenger Link</span> <span className="font-medium text-blue-600 break-all">{adopter.fb_link || 'Not provided'}</span></div>
              <div className="col-span-2"><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Address</span> <span className="font-medium text-sol-dark">{adopter.address || 'N/A'}, {adopter.city || ''}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Occupation</span> <span className="font-medium text-sol-dark">{adopter.occupation || 'N/A'} ({adopter.employment_status || 'N/A'})</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark border-b border-sol-dark/5 pb-3 mb-4">Home Environment</h2>
            <p className="text-sm text-sol-dark/80 leading-relaxed whitespace-pre-wrap">{appData.home_environment_notes || 'No notes provided by the applicant.'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-sol-dark text-white p-6 rounded-xl shadow-sm flex flex-col">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-3">Applying For</div>
            <div className="h-48 w-full bg-black/30 rounded-lg mb-4 overflow-hidden relative border border-white/10 shadow-inner flex items-center justify-center">
              {animalPhotoUrl ? <img src={animalPhotoUrl} alt={animal.name || 'Animal'} className="w-full h-full object-cover" /> : <i className="ti ti-paw text-5xl text-white/20"></i>}
            </div>
            <h2 className="font-serif text-2xl font-bold mb-4">{animal.name || 'Unknown Animal'}</h2>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Species</span> <span className="capitalize font-medium">{animal.species || 'N/A'}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Sex</span> <span className="capitalize font-medium">{animal.sex || 'N/A'}</span></div>
              <div className="flex justify-between pb-2"><span>Age</span> <span className="capitalize font-medium">{animal.age_estimate || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark mb-4">Admin Actions</h2>
            
            {['submitted', 'interview', 'handover'].includes(appData.status) ? (
              <div className="space-y-3">
                
                {prevStatus && (
                  <button 
                    onClick={() => handleUpdateStatus(prevStatus)} 
                    disabled={isUpdating} 
                    className="w-full bg-sol-dark/5 text-sol-dark/60 border border-sol-dark/10 py-2.5 rounded-lg font-bold text-sm hover:bg-sol-dark/10 hover:text-sol-dark transition-colors shadow-sm flex items-center justify-center gap-2 mb-2"
                  >
                    <i className="ti ti-arrow-left"></i> Move back to {getStatusText(prevStatus)}
                  </button>
                )}

                {appData.status === 'submitted' && (
                  <button onClick={() => handleUpdateStatus('interview')} disabled={isUpdating} className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <i className="ti ti-video"></i> Pass Form (Move to Interview)
                  </button>
                )}

                {appData.status === 'interview' && (
                  <button onClick={() => handleUpdateStatus('handover')} disabled={isUpdating} className="w-full bg-purple-50 text-purple-700 border border-purple-200 py-3 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <i className="ti ti-file-text"></i> Pass Interview (Move to Handover)
                  </button>
                )}

                {appData.status === 'handover' && (
                  <button onClick={() => handleUpdateStatus('approved')} disabled={isUpdating} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <i className="ti ti-check"></i> Complete Adoption!
                  </button>
                )}
                
                <button 
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdating}
                  className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm mt-4"
                >
                  Reject Application
                </button>
              </div>
            ) : (
              <div className="text-sm text-sol-dark/60 bg-sol-cream p-4 rounded-lg text-center border border-sol-dark/5 shadow-inner flex flex-col gap-2 mb-4">
                <div>This application has been closed and marked as <strong className="capitalize text-sol-dark">{getStatusText(appData.status)}</strong>.</div>
                
                {appData.status === 'approved' && (
                  <div className="text-green-700 font-bold bg-green-50 p-3 rounded border border-green-200 mt-2 flex items-center justify-center gap-2">
                    <i className="ti ti-check"></i> Adoption Completed!
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-sol-dark/5">
              <p className="text-[10px] text-sol-dark/50 mb-3 font-medium uppercase tracking-wider">Manual Override</p>
              <div className="flex flex-col gap-3">
                <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} className="w-full bg-[#f8f7f2] border border-sol-dark/10 px-4 py-3 rounded-lg text-sm font-bold text-sol-dark outline-none focus:border-sol-yellow shadow-sm">
                  <option value="submitted">1. Form Review</option>
                  <option value="interview">2. Interview Phase</option>
                  <option value="handover">3. Handover Process</option>
                  <option value="approved">✅ Successfully Adopted</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                <button onClick={() => handleUpdateStatus(targetStatus)} disabled={isUpdating || targetStatus === appData.status} className="w-full bg-sol-dark text-sol-yellow py-3 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUpdating ? <><i className="ti ti-loader animate-spin"></i> Updating...</> : 'Save New Stage'}
                </button>
              </div>
            </div>

          </div>
        </div> 
      </div>
    </div>
  );
}