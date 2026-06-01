'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionsPage() {
  const supabase = createClient();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
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
    <div className="p-2 sm:p-4 md:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 flex justify-between items-start sm:items-end gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-sol-dark mb-1 sm:mb-2">Successful Adoptions</h1>
          <p className="text-sol-dark/60 text-xs sm:text-sm">A record of every animal that has found their forever home.</p>
        </div>
        <div className="bg-green-50 text-green-700 border border-green-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 shadow-sm shrink-0 text-xs sm:text-base">
          <i className="ti ti-heart text-sm sm:text-lg"></i> <span>{filteredAdoptions.length}</span> <span className="hidden sm:inline">Adoptions</span>
        </div>
      </div>

      {/* Filter & Search Bar - FIX: Forced into a single row */}
      <div className="flex flex-row gap-2 w-full mb-4 sm:mb-6">
        <div className="relative flex-1 min-w-0">
          <i className="ti ti-search absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-xs sm:text-base"></i>
          <input 
            type="text" 
            placeholder="Search name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none shadow-sm"
          />
        </div>
        {/* FIX: Removed min-width to prevent line breaks, used w-1/3 to share space nicely */}
        <select 
          value={speciesFilter} 
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="w-1/3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none shadow-sm cursor-pointer"
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
        <div className="bg-white rounded-xl sm:rounded-2xl border border-sol-dark/10 p-8 sm:p-16 text-center shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sol-yellow/20 rounded-full flex items-center justify-center text-sol-yellow mx-auto mb-4">
            <i className="ti ti-mood-empty text-2xl sm:text-3xl"></i>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-sol-dark mb-1 sm:mb-2">No Records Found</h2>
          <p className="text-xs sm:text-sm text-sol-dark/60">No adoption records match your current search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-sol-dark/10 shadow-sm overflow-hidden">
          {/* FIX: Removed horizontal overflow and minimum width restrictions entirely */}
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/5 text-[9px] sm:text-xs uppercase tracking-wider text-sol-dark/50">
                  {/* Hidden on phones to save space */}
                  <th className="hidden md:table-cell p-3 sm:p-4 font-bold">Date Adopted</th>
                  <th className="p-3 sm:p-4 font-bold">Animal</th>
                  <th className="p-3 sm:p-4 font-bold">Adopter</th>
                  <th className="p-3 sm:p-4 font-bold text-right sm:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {filteredAdoptions.map((record) => {
                  const animal = record.animals || {};
                  const adopter = record.adopters || {};
                  const adopterName = adopter.first_name ? `${adopter.first_name} ${adopter.last_name}` : (adopter.full_name || 'Unknown Adopter');

                  return (
                    <tr key={record.adoption_id} className="hover:bg-sol-cream/20 transition-colors">
                      
                      {/* Hidden on phones */}
                      <td className="hidden md:table-cell p-3 sm:p-4 text-xs sm:text-sm font-medium text-sol-dark align-top sm:align-middle">
                        {record.adoption_date ? new Date(record.adoption_date).toLocaleDateString() : 'Unknown Date'}
                      </td>
                      
                      <td className="p-3 sm:p-4 align-top sm:align-middle min-w-0">
                        <div className="font-bold text-[10px] sm:text-sm text-sol-dark flex items-start sm:items-center gap-1 sm:gap-2 break-words">
                          <i className="ti ti-paw text-sol-yellow hidden sm:inline-block"></i> <span className="line-clamp-2">{animal.name || 'Unknown Animal'}</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-sol-dark/50 uppercase tracking-widest mt-0.5">{animal.species || 'N/A'}</div>
                      </td>
                      
                      <td className="p-3 sm:p-4 align-top sm:align-middle min-w-0">
                        <div className="font-bold text-[10px] sm:text-sm text-sol-dark flex items-start sm:items-center gap-1 sm:gap-2 break-words">
                          <i className="ti ti-user text-sol-dark/30 hidden sm:inline-block"></i> <span className="line-clamp-2">{adopterName}</span>
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-sol-dark/50 mt-0.5 truncate max-w-[80px] sm:max-w-[200px]">{adopter.email || 'No email'}</div>
                      </td>
                      
                      <td className="p-3 sm:p-4 align-top sm:align-middle">
                        {/* FIX: Buttons stack vertically on phone, side-by-side on tablet */}
                        <div className="flex flex-col xl:flex-row items-end sm:items-center justify-end sm:justify-start gap-1 sm:gap-2">
                          <Link href={`/animals/${animal.animal_id}/edit`} className="text-[8px] sm:text-xs font-bold text-sol-yellow border border-sol-yellow/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg hover:bg-sol-yellow hover:text-sol-dark transition-colors inline-flex items-center gap-1 whitespace-nowrap">
                            <i className="ti ti-edit hidden sm:inline-block"></i> Edit <span className="hidden sm:inline">Animal</span>
                          </Link>
                          
                          <button 
                            onClick={() => handleDelete(record.adoption_id)}
                            disabled={isUpdating}
                            className="text-[8px] sm:text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg hover:bg-red-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                            title="Delete Record"
                          >
                            <i className="ti ti-trash hidden sm:inline-block"></i> Delete
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