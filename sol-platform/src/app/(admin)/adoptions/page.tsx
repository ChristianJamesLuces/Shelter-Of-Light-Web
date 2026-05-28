'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionsPage() {
  const supabase = createClient();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdoptions() {
      // Fetch only applications that have been 'approved'
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
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching adoptions:', error);
      } else if (data) {
        setAdoptions(data);
      }
      setIsLoading(false);
    }
    
    fetchAdoptions();
  }, [supabase]);

  if (isLoading) {
    return <div className="p-12 text-center text-sol-dark/50 font-medium">Loading adoptions data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-sol-dark mb-1">Successful Adoptions</h1>
          <p className="text-sol-dark/60 text-sm">A record of every animal that has found their forever home.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 text-sm font-bold shadow-sm flex items-center gap-2">
          <i className="ti ti-heart-filled text-green-600"></i>
          {adoptions.length} {adoptions.length === 1 ? 'Total Adoption' : 'Total Adoptions'}
        </div>
      </div>

      {/* Empty State */}
      {adoptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-sol-dark/10 p-16 text-center">
          <div className="w-16 h-16 bg-sol-cream text-sol-yellow rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-mood-empty text-3xl"></i>
          </div>
          <h3 className="text-lg font-bold text-sol-dark mb-2">No Adoptions Yet</h3>
          <p className="text-sol-dark/60 text-sm max-w-md mx-auto">
            Once you approve an application in the Applications tab, it will automatically appear here as a successful adoption.
          </p>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white rounded-xl shadow-sm border border-sol-dark/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f7f2] text-sol-dark/60 font-bold uppercase tracking-wider text-[10px] border-b border-sol-dark/10">
                <tr>
                  <th className="px-6 py-4">Animal</th>
                  <th className="px-6 py-4">Adopter</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Date Approved</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {adoptions.map((record) => {
                  const animalPhotoUrl = record.animals?.animal_photos?.[0]?.file_url;
                  
                  return (
                    <tr key={record.application_id} className="hover:bg-sol-cream/30 transition-colors">
                      
                      {/* Animal Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-sol-dark/5 overflow-hidden shrink-0 border border-sol-dark/10 flex items-center justify-center">
                            {animalPhotoUrl ? (
                              <img src={animalPhotoUrl} alt={record.animals?.name} className="w-full h-full object-cover" />
                            ) : (
                              <i className="ti ti-paw text-sol-dark/20"></i>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sol-dark">{record.animals?.name}</div>
                            <div className="text-[11px] text-sol-dark/50 capitalize font-medium">{record.animals?.species}</div>
                          </div>
                        </div>
                      </td>

                      {/* Adopter Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sol-dark">{record.adopters?.full_name}</div>
                        <div className="text-xs text-sol-dark/60 truncate max-w-[150px]">{record.adopters?.city}</div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="text-sol-dark text-xs mb-1"><i className="ti ti-mail text-sol-dark/40 mr-1"></i> {record.adopters?.email}</div>
                        <div className="text-sol-dark text-xs"><i className="ti ti-phone text-sol-dark/40 mr-1"></i> {record.adopters?.phone}</div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4">
                        <div className="text-sol-dark font-medium">
                          {new Date(record.created_at || record.application_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/applications/${record.application_id}`}
                          className="inline-flex items-center justify-center gap-2 bg-sol-cream hover:bg-sol-yellow/20 text-sol-dark px-3 py-1.5 rounded-md text-xs font-bold transition-colors border border-sol-dark/5"
                        >
                          View Record &rarr;
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