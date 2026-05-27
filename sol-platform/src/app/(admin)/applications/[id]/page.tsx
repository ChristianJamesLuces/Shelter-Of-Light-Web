'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
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
        // Automatic "In Review" trigger
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
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('application_id', params.id);

    if (!error) {
      setAppData({ ...appData, status: newStatus });
    } else {
      alert("Failed to update status. Please try again.");
    }
    
    setIsUpdating(false);
  };

  if (isLoading) return <div className="p-12 text-center text-sol-dark/50">Loading application details...</div>;
  
  if (!appData) return (
    <div className="p-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
      <Link href="/applications" className="text-sol-yellow hover:underline">&larr; Back to Applications</Link>
    </div>
  );

  // Extract the photo URL safely
  const animalPhotoUrl = appData.animals?.animal_photos?.[0]?.file_url;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Header & Back Button */}
      <div className="mb-8">
        <Link href="/applications" className="text-sm font-bold text-sol-dark/50 hover:text-sol-dark transition-colors mb-4 inline-block">
          &larr; Back to all applications
        </Link>
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
              appData.status === 'under_review' ? 'text-amber-600' :
              'text-indigo-600'
            }`}>
              {appData.status === 'under_review' ? 'In Review' : appData.status}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark border-b border-sol-dark/5 pb-3 mb-4">Applicant Profile</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Full Name</span> <span className="font-medium text-sol-dark">{appData.adopters.full_name}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Age</span> <span className="font-medium text-sol-dark">{appData.adopters.age} years old</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Email</span> <span className="font-medium text-sol-dark">{appData.adopters.email}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Phone</span> <span className="font-medium text-sol-dark">{appData.adopters.phone}</span></div>
              <div className="col-span-2"><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Address</span> <span className="font-medium text-sol-dark">{appData.adopters.address}, {appData.adopters.city}</span></div>
              <div><span className="block text-sol-dark/50 text-[10px] uppercase font-bold tracking-wider mb-1">Occupation</span> <span className="font-medium text-sol-dark">{appData.adopters.occupation} ({appData.adopters.employment_status})</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark border-b border-sol-dark/5 pb-3 mb-4">Home Environment</h2>
            <p className="text-sm text-sol-dark/80 leading-relaxed whitespace-pre-wrap">
              {appData.home_environment_notes}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Animal & Actions */}
        <div className="space-y-6">
          
          <div className="bg-sol-dark text-white p-6 rounded-xl shadow-sm flex flex-col">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-3">Applying For</div>
            
            {/* THE RESTORED PHOTO */}
            <div className="h-48 w-full bg-black/30 rounded-lg mb-4 overflow-hidden relative border border-white/10 shadow-inner">
              {animalPhotoUrl ? (
                <img 
                  src={animalPhotoUrl} 
                  alt={appData.animals.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <i className="ti ti-paw text-5xl"></i>
                </div>
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold mb-4">{appData.animals.name}</h2>
            
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Species</span> <span className="capitalize font-medium">{appData.animals.species}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Sex</span> <span className="capitalize font-medium">{appData.animals.sex}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span>Age</span> <span className="capitalize font-medium">{appData.animals.age_estimate}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-sol-dark/10">
            <h2 className="text-lg font-bold text-sol-dark mb-4">Admin Actions</h2>
            
            {appData.status === 'submitted' || appData.status === 'under_review' ? (
              <div className="space-y-3">
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
              <div className="text-sm text-sol-dark/60 bg-sol-cream p-4 rounded-lg text-center border border-sol-dark/5 shadow-inner">
                This application has already been <strong className="capitalize text-sol-dark">{appData.status === 'under_review' ? 'in review' : appData.status}</strong>. No further action required.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}