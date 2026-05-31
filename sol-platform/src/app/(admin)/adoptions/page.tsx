'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionsPage() {
  const supabase = createClient();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // New States for Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');

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

  // Delete Function
  const handleDelete = async (adoptionId: string) => {
    if (!confirm('Are you sure you want to delete this adoption record? Note: This will not automatically change the animal back to "Available".')) return;
    
    setIsUpdating(true);
    const { error } = await supabase.from('adoptions').delete().eq('adoption_id', adoptionId);

    if (error) {
      alert(`Error deleting record: ${error.message}`);
    } else {
      setAdoptions(prev => prev.filter(a => a.adoption_id !== adoptionId));
    }
    setIsUpdating(false);
  };

  // Filter Logic
  const filteredAdoptions = adoptions.filter(record => {
    const animal = record.animals || {};
    const adopter = record.adopters || {};
    const adopterName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || '');
    
    const matchesSearch = (animal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          adopterName.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesSpecies = speciesFilter === 'All' || (animal.species || '').toLowerCase() === speciesFilter.toLowerCase();
    
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Successful Adoptions</h1>
          <p className="text-sol-dark/60 text-sm">A record of every animal that has found their forever home.</p>
        </div>
        <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm shrink-0">
          <i className="ti ti-heart"></i> {filteredAdoptions.length} Adoptions
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40"></i>
          <input 
            type="text" 
            placeholder="Search by animal or adopter name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none shadow-sm"
          />
        </div>
        <select 
          value={speciesFilter} 
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none shadow-sm cursor-pointer min-w-[150px]"
        >
          <option value="All">All Species</option>
          <option value="cat">Cats</option>
          <option value="dog">Dogs</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-sol-dark/50">
          <i className="ti ti-loader animate-spin text-4xl text-sol-yellow"></i>
        </div>
      ) : filteredAdoptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sol-dark/10 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-sol-yellow/20 rounded-full flex items-center justify-center text-sol-yellow mx-auto mb-4">
            <i className="ti ti-mood-empty text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-sol-dark mb-2">No Records Found</h2>
          <p className="text-sm text-sol-dark/60">No adoption records match your current search or filters.</p>
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
                {filteredAdoptions.map((record) => {
                  const animal = record.animals || {};
                  const adopter = record.adopters || {};
                  const adopterName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || 'Unknown Adopter');

                  return (
                    <tr key={record.adoption_id} className="hover:bg-sol-cream/20 transition-colors">
                      
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
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/animals/${animal.animal_id}/edit`} className="text-xs font-bold text-sol-yellow border border-sol-yellow/30 px-3 py-1.5 rounded-lg hover:bg-sol-yellow hover:text-sol-dark transition-colors inline-flex items-center gap-1">
                            <i className="ti ti-edit"></i> Edit Animal
                          </Link>
                          
                          <button 
                            onClick={() => handleDelete(record.adoption_id)}
                            disabled={isUpdating}
                            className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            title="Delete Record"
                          >
                            <i className="ti ti-trash"></i> Delete
                          </button>
                        </div>
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