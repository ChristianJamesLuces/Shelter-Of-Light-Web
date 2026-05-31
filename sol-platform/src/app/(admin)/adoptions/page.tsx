'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionsPage() {
  const supabase = createClient();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        *,
        animals (*),
        adopters (*)
      `)
      .order('adoption_date', { ascending: false });

    if (error) {
      console.error("Error fetching adoptions:", error);
    } else if (data) {
      setAdoptions(data);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Successful Adoptions</h1>
          <p className="text-sol-dark/60 text-sm">A record of every animal that has found their forever home.</p>
        </div>
        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm shrink-0">
          <i className="ti ti-heart"></i> {adoptions.length} Total Adoptions
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-sol-dark/50">
          <i className="ti ti-loader animate-spin text-4xl text-sol-yellow"></i>
        </div>
      ) : adoptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sol-dark/10 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-sol-yellow/20 rounded-full flex items-center justify-center text-sol-yellow mx-auto mb-4">
            <i className="ti ti-mood-empty text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-sol-dark mb-2">No Adoptions Yet</h2>
          <p className="text-sm text-sol-dark/60">Once you approve an application in the Applications tab, it will automatically appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sol-dark/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/5 text-xs uppercase tracking-wider text-sol-dark/50">
                  <th className="p-4 font-bold">Date Adopted</th>
                  <th className="p-4 font-bold">Animal</th>
                  <th className="p-4 font-bold">Adopter</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {adoptions.map((record) => {
                  const animal = record.animals || {};
                  const adopter = record.adopters || {};
                  const adopterName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || 'Unknown Adopter');

                  return (
                    <tr key={record.adoption_id || record.id || animal.animal_id} className="hover:bg-sol-cream/20 transition-colors">
                      
                      <td className="p-4 text-sm font-medium text-sol-dark">
                        {record.adoption_date ? new Date(record.adoption_date).toLocaleDateString() : 'Unknown Date'}
                      </td>
                      
                      <td className="p-4">
                        <div className="font-bold text-sol-dark flex items-center gap-2">
                          <i className="ti ti-paw text-sol-yellow"></i> {animal.name || 'Unknown Animal'}
                        </div>
                        <div className="text-[10px] text-sol-dark/50 uppercase tracking-widest mt-0.5">{animal.species || 'N/A'}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-bold text-sol-dark flex items-center gap-2">
                          <i className="ti ti-user text-sol-dark/30"></i> {adopterName}
                        </div>
                        <div className="text-[10px] text-sol-dark/50 mt-0.5">{adopter.email || 'No email'}</div>
                      </td>
                      
                      <td className="p-4 flex gap-2">
                        {/* THE FIX: Corrected URL path to point to the edit page */}
                        <Link href={`/animals/${animal.animal_id}/edit`} className="text-xs font-bold text-sol-yellow border border-sol-yellow/30 px-3 py-1.5 rounded-lg hover:bg-sol-yellow hover:text-sol-dark transition-colors inline-flex items-center gap-1">
                          <i className="ti ti-edit"></i> Edit Animal
                        </Link>
                        <Link href={`/adopt/${animal.animal_id}`} target="_blank" className="text-xs font-bold text-sol-dark/50 border border-sol-dark/10 px-3 py-1.5 rounded-lg hover:bg-sol-dark/5 transition-colors inline-flex items-center gap-1">
                           View Public <i className="ti ti-external-link"></i>
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