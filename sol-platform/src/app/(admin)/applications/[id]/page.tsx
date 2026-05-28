'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendStatusEmail } from '@/app/actions/email'; // Your Resend email function!

export default function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter(); 
  
  const [appData, setAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchApplicationDetails() {
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
        .eq('application_id', params.id)
        .single();

      if (data) {
        // Automatically move from 'submitted' to 'under_review' when opened
        if (data.status === 'submitted') {
          const { error: updateError } = await supabase
            .from('applications')
            .update({ status: 'under_review' })
            .eq('application_id', params.id);
            
          if (!updateError) {
            setAppData({ ...data, status: 'under_review' });
          } else {
            setAppData(data);
          }
        } else {
          setAppData(data);
        }
      }
      setIsLoading(false);
    }
    fetchApplicationDetails();
  }, [params.id, supabase]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    
    // 1. Update the application status in the database
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('application_id', params.id);

    if (!appError) {
      // 2. If approved, automatically mark the animal as 'adopted'
      if (newStatus === 'approved' && appData.animals?.animal_id) {
        const { error: animalError } = await supabase
          .from('animals')
          .update({ adoption_status: 'adopted' })
          .eq('animal_id', appData.animals.animal_id);

        if (animalError) {
          console.error("Failed to update animal status:", animalError);
        }
      }

      // 3. Trigger the Automated Status Email
      if (['approved', 'rejected', 'interview'].includes(newStatus) && appData.adopters?.email) {
        await sendStatusEmail(
          appData.adopters.email,
          appData.adopters.full_name || 'Adopter',
          appData.animals?.name || 'the animal',
          newStatus
        );
      }

      alert(`Success! Status updated to ${newStatus} and email notification triggered.`);
      setAppData({ ...appData, status: newStatus });
    } else {
      console.error(appError);
      alert("Failed to update status. Please try again.");
    }
    
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this application? This action cannot be undone.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Delete the application record
      const { error: appError } = await supabase
        .from('applications')
        .delete()
        .eq('application_id', params.id);

      if (appError) throw appError;

      // 2. Safely clean up orphaned adopter data (if it exists)
      if (appData.adopter_id) {
        await supabase
          .from('adopters')
          .delete()
          .eq('adopter_id', appData.adopter_id);
      }

      alert('Application deleted successfully.');
      router.push('/applications');
      router.refresh();
        
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert(`Error deleting data: ${error.message || error}`);
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-sol-dark/50">Loading application details...</div>;
  
  if (!appData) return (
    <div className="p-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
      <Link href="/applications" className="text-sol-yellow hover:underline">&larr; Back to Applications</Link>
    </div>
  );

  // Safely extract data using optional chaining to prevent null crashes
  const adopter = appData.adopters || {};
  const animal = appData.animals || {};
  const animalPhotoUrl = animal.animal_photos?.[0]?.file_url;

  const getStatusText = (status: string) => {
    if (status === 'under_review') return 'In Review';
    if (status === 'interview') return 'Interview Scheduled';
    return status;
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/applications" className="text-sm font-bold text-sol-dark/50 hover:text-sol-dark transition-colors inline-block">
            &larr; Back to all applications
          </Link>
          
          <button 
            onClick={handleDelete} 
            disabled={isUpdating}
            className="text-xs bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <i className="ti ti-trash"></i> Delete Application
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-3xl font-bold text-sol-dark">Application Review</h1>
            <p className="text-sol-dark/60 mt-1">Submitted on {new Date(appData.created_at || appData.application_date).toLocaleDateString()}</p>
          </div>
          
          <div className="bg-white border border-sol-dark/10 px-6 py-3 rounded-xl shadow-sm text-center">
            <div className="text-[10px] uppercase tracking-widest text-sol-dark/40 font-bold mb-1">Current Status</div>
            <div className={`font-bold capitalize ${
              appData.status === 'approved' ? 'text-green-600' : 
              appData.status === 'rejected' ? 'text-red-600' : 
              appData.status === 'interview' ? 'text-purple-600' : 
              appData.status === 'under_review' ? 'text-amber-600' :
              'text-indigo-600'
            }`}>
              {getStatusText(appData.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark border-b border-sol-dark/5 pb-3 mb-4">Applicant Profile</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Full Name</span> <span className="font-medium text-sol-dark">{adopter.full_name || 'Unknown Adopter'}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Age</span> <span className="font-medium text-sol-dark">{adopter.age ? `${adopter.age} years old` : 'N/A'}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Email</span> <span className="font-medium text-sol-dark">{adopter.email || 'N/A'}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Phone</span> <span className="font-medium text-sol-dark">{adopter.phone || 'N/A'}</span></div>
              <div className="col-span-2"><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Address</span> <span className="font-medium text-sol-dark">{adopter.address || 'N/A'}, {adopter.city || ''}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Occupation</span> <span className="font-medium text-sol-dark">{adopter.occupation || 'N/A'} ({adopter.employment_status || 'N/A'})</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark border-b border-sol-dark/5 pb-3 mb-4">Home Environment</h2>
            <p className="text-sm text-sol-dark/80 leading-relaxed whitespace-pre-wrap">
              {appData.home_environment_notes || 'No notes provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-sol-dark text-white p-6 rounded-xl shadow-sm flex flex-col">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-3">Applying For</div>
            
            <div className="h-48 w-full bg-black/30 rounded-lg mb-4 overflow-hidden relative border border-white/10 shadow-inner">
              {animalPhotoUrl ? (
                <img src={animalPhotoUrl} alt={animal.name || 'Animal'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20"><i className="ti ti-paw text-5xl"></i></div>
              )}
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
            
            {appData.status === 'submitted' || appData.status === 'under_review' || appData.status === 'interview' ? (
              <div className="space-y-3">
                {appData.status !== 'interview' && (
                  <button 
                    onClick={() => handleUpdateStatus('interview')}
                    disabled={isUpdating}
                    className="w-full bg-purple-50 text-purple-700 border border-purple-200 py-3 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                  >
                    <i className="ti ti-video"></i>
                    {isUpdating ? 'Updating...' : 'Move to Interview Stage'}
                  </button>
                )}

                <button 
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isUpdating}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isUpdating ? 'Updating...' : 'Approve Application'}
                </button>
                
                <button 
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isUpdating}
                  className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
                >
                  Reject Application
                </button>
              </div>
            ) : (
              <div className="text-sm text-sol-dark/60 bg-sol-cream p-4 rounded-lg text-center border border-sol-dark/5 shadow-inner flex flex-col gap-2">
                <div>This application has already been <strong className="capitalize text-sol-dark">{getStatusText(appData.status)}</strong>.</div>
                
                {appData.status === 'approved' && (
                  <div className="text-green-700 font-bold bg-green-50 p-3 rounded border border-green-200 mt-2 flex items-center justify-center gap-2">
                    <i className="ti ti-check"></i> Adoption Approved!
                  </div>
                )}
              </div>
            )}
          </div>

        </div>  
      </div>
    </div>
  );
}