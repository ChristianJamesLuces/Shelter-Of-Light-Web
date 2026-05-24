'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [appData, setAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch the specific application data on load
  useEffect(() => {
    async function fetchApplicationDetails() {
      const { data, error } = await supabase
        .from('applications')
        .select(`
            *,
            adopters (*),
            animals (
            *,
            animal_photos ( file_url, is_primary )
            )
        `)
        .eq('application_id', params.id)
        .single();

      if (error) {
        console.error('Error fetching details:', error);
        setError('Could not load application details.');
      } else {
        setAppData(data);
      }
      setIsLoading(false);
    }

    fetchApplicationDetails();
  }, [params.id]);

  // 2. Handle Approve or Reject
  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this application as ${newStatus.toUpperCase()}?`)) return;
    
    setIsUpdating(true);
    
    try {
      // Update the application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('application_id', params.id);

      if (updateError) throw updateError;

      // If approved, you might also want to update the animal's status!
      if (newStatus === 'approved') {
        await supabase
          .from('animals')
          .update({ adoption_status: 'Adopted' }) // Assuming this matches your animal status values
          .eq('animal_id', appData.animal_id);
      }

      // Refresh the local data to show the new status
      setAppData({ ...appData, status: newStatus });
      
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Check console for details.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8 max-w-4xl mx-auto mt-12 text-center text-sol-dark/50">Loading application details...</div>;
  if (error || !appData) return <div className="p-8 max-w-4xl mx-auto mt-12 bg-red-50 text-red-600 rounded-lg">{error || 'Application not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header & Back Button */}
      <div className="mb-8">
        <Link href="/applications" className="text-sm text-sol-dark/60 hover:text-sol-yellow mb-4 inline-block transition-colors">
          &larr; Back to all applications
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-sol-dark font-bold mb-2">Review Application</h1>
            <p className="text-sm text-sol-dark/60">Application #{appData.application_id} • Submitted on {new Date(appData.application_date || appData.created_at).toLocaleDateString()}</p>
          </div>
          
          {/* Status Badge */}
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
            appData.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' :
            appData.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {appData.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Applicant Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-sol-dark/10 shadow-sm">
            <h2 className="text-lg font-bold text-sol-dark mb-4 border-b pb-2">Applicant Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Full Name</span><span className="text-sol-dark font-medium">{appData.adopters?.full_name}</span></div>
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Age</span><span className="text-sol-dark">{appData.adopters?.age}</span></div>
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Email</span><span className="text-sol-dark">{appData.adopters?.email}</span></div>
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Phone</span><span className="text-sol-dark">{appData.adopters?.phone}</span></div>
              <div className="col-span-2"><span className="block text-xs font-bold text-sol-dark/50 uppercase">Address</span><span className="text-sol-dark">{appData.adopters?.address}, {appData.adopters?.city}</span></div>
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Occupation</span><span className="text-sol-dark">{appData.adopters?.occupation}</span></div>
              <div><span className="block text-xs font-bold text-sol-dark/50 uppercase">Employment</span><span className="text-sol-dark">{appData.adopters?.employment_status}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-sol-dark/10 shadow-sm">
            <h2 className="text-lg font-bold text-sol-dark mb-4 border-b pb-2">Home Environment</h2>
            <p className="text-sol-dark/80 whitespace-pre-wrap leading-relaxed">
              {appData.home_environment_notes || 'No notes provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Animal & Actions */}
        <div className="space-y-6">
          <div className="bg-[#f8f7f2] p-6 rounded-xl border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark mb-4">Adopting</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-sol-dark flex items-center justify-center">
                {appData.animals?.animal_photos?.find((p: any) => p.is_primary)?.file_url ? (
                    <img 
                    src={appData.animals.animal_photos.find((p: any) => p.is_primary).file_url} 
                    alt={appData.animals?.name} 
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-sol-yellow font-bold text-xl">
                    {appData.animals?.name?.charAt(0)}
                    </span>
                )}
                </div>
              <div>
                <div className="font-bold text-sol-dark text-lg">{appData.animals?.name}</div>
                <div className="text-sm text-sol-dark/60 capitalize">{appData.animals?.species} • {appData.animals?.breed || 'Mixed'}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Only show if not already approved/rejected) */}
          {(appData.status === 'submitted' || appData.status === 'under_review') && (
            <div className="bg-white p-6 rounded-xl border border-sol-dark/10 shadow-sm flex flex-col gap-3">
              <h2 className="text-sm font-bold text-sol-dark uppercase tracking-wider mb-2">Actions</h2>
              <button 
                onClick={() => handleStatusUpdate('approved')}
                disabled={isUpdating}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Approve Application
              </button>
              <button 
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isUpdating}
                className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                Reject Application
              </button>
            </div>
          )}
          
          {appData.status === 'approved' && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-green-800 text-center text-sm font-medium">
              This application has been approved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}