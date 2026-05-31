'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AnimalsPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*, animal_photos(file_url)')
      .order('created_at', { ascending: false });

    if (data) setAnimals(data);
    if (error) console.error("Error fetching animals:", error);
    setIsLoading(false);
  };

  // Calculate stats for the top highlights
  const stats = {
    total: animals.length,
    available: animals.filter(a => (a.adoption_status || 'available').toLowerCase() === 'available').length,
    adopted: animals.filter(a => (a.adoption_status || '').toLowerCase() === 'adopted').length,
    onHold: animals.filter(a => (a.adoption_status || '').toLowerCase() === 'on hold').length,
    sanctuary: animals.filter(a => (a.adoption_status || '').toLowerCase() === 'sanctuary resident').length,
  };

  // Filter logic: Checks both the search bar and the status dropdown/highlights
  const filteredAnimals = animals.filter(animal => {
    const status = (animal.adoption_status || 'available').toLowerCase();
    const matchesSearch = (animal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (animal.species || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Animal Inventory</h1>
          <p className="text-sol-dark/60 text-sm">Manage all rescues and their current adoption statuses.</p>
        </div>
        <Link 
          href="/animals/new" 
          className="bg-sol-dark text-sol-yellow px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ti ti-plus"></i> Add New Animal
        </Link>
      </div>

      {/* TOP HIGHLIGHTS (Clickable to filter) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button onClick={() => setStatusFilter('All')} className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'All' ? 'bg-sol-dark text-sol-yellow border-sol-dark shadow-md' : 'bg-white border-sol-dark/10 hover:border-sol-dark/30 text-sol-dark shadow-sm'}`}>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-70 mb-1">Total Animals</div>
          <div className="text-2xl font-serif font-bold">{stats.total}</div>
        </button>
        <button onClick={() => setStatusFilter('available')} className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'available' ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-sol-dark/10 hover:border-blue-200 shadow-sm'}`}>
          <div className="text-[10px] uppercase tracking-wider font-bold text-blue-600/70 mb-1">Available</div>
          <div className="text-2xl font-serif font-bold text-blue-700">{stats.available}</div>
        </button>
        <button onClick={() => setStatusFilter('on hold')} className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'on hold' ? 'bg-amber-50 border-amber-200 shadow-md' : 'bg-white border-sol-dark/10 hover:border-amber-200 shadow-sm'}`}>
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-600/70 mb-1">On Hold</div>
          <div className="text-2xl font-serif font-bold text-amber-700">{stats.onHold}</div>
        </button>
        <button onClick={() => setStatusFilter('adopted')} className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'adopted' ? 'bg-green-50 border-green-200 shadow-md' : 'bg-white border-sol-dark/10 hover:border-green-200 shadow-sm'}`}>
          <div className="text-[10px] uppercase tracking-wider font-bold text-green-600/70 mb-1">Adopted</div>
          <div className="text-2xl font-serif font-bold text-green-700">{stats.adopted}</div>
        </button>
        <button onClick={() => setStatusFilter('sanctuary resident')} className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'sanctuary resident' ? 'bg-purple-50 border-purple-200 shadow-md' : 'bg-white border-sol-dark/10 hover:border-purple-200 shadow-sm'}`}>
          <div className="text-[10px] uppercase tracking-wider font-bold text-purple-600/70 mb-1">Sanctuary</div>
          <div className="text-2xl font-serif font-bold text-purple-700">{stats.sanctuary}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mb-6">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40"></i>
          <input 
            type="text" 
            placeholder="Search name or species..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none shadow-sm"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none shadow-sm cursor-pointer min-w-[200px]"
        >
          <option value="All">All Statuses</option>
          <option value="available">Available</option>
          <option value="on hold">On Hold</option>
          <option value="sanctuary resident">Sanctuary Resident</option>
          <option value="adopted">Adopted</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-sol-dark/50">
          <i className="ti ti-loader animate-spin text-4xl text-sol-yellow"></i>
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sol-dark/10 p-16 text-center shadow-sm mt-8">
          <div className="w-16 h-16 bg-sol-yellow/20 rounded-full flex items-center justify-center text-sol-yellow mx-auto mb-4">
            <i className="ti ti-paw text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-sol-dark mb-2">No Animals Found</h2>
          <p className="text-sm text-sol-dark/60">Try adjusting your filters or search query.</p>
          {statusFilter !== 'All' && (
            <button onClick={() => setStatusFilter('All')} className="mt-4 text-sol-yellow font-bold text-sm hover:underline">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => {
            const photoUrl = animal.animal_photos?.[0]?.file_url;
            const status = (animal.adoption_status || 'available').toLowerCase();
            
            // Dynamic Badge Styling
            let badgeStyle = 'bg-white text-sol-dark border border-sol-dark/10';
            if (status === 'adopted') badgeStyle = 'bg-green-100 text-green-700 border border-green-200';
            if (status === 'on hold') badgeStyle = 'bg-amber-100 text-amber-700 border border-amber-200';
            if (status === 'sanctuary resident') badgeStyle = 'bg-purple-100 text-purple-700 border border-purple-200';
            if (status === 'available') badgeStyle = 'bg-blue-50 text-blue-700 border border-blue-200';
            
            return (
              <div key={animal.animal_id} className="bg-white rounded-2xl border border-sol-dark/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-sol-cream relative overflow-hidden flex-shrink-0 border-b border-sol-dark/5">
                  {photoUrl ? (
                    <img src={photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sol-dark/20">
                      <i className="ti ti-photo text-4xl"></i>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${badgeStyle}`}>
                      {animal.adoption_status || 'Available'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-sol-dark truncate pr-2">{animal.name}</h3>
                    <span className="text-[10px] text-sol-dark/60 font-bold uppercase tracking-wider bg-sol-dark/5 px-2 py-1 rounded-md mt-0.5">{animal.species}</span>
                  </div>
                  
                  <div className="text-xs text-sol-dark/60 mb-6 space-y-1.5">
                    <div className="flex justify-between border-b border-sol-dark/5 pb-1">
                      <span className="font-medium opacity-70">Age</span> 
                      <span className="text-sol-dark font-medium">{animal.age_estimate || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium opacity-70">Sex</span> 
                      <span className="text-sol-dark font-medium capitalize">{animal.sex || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    {/* Full-width Edit Button */}
                    <Link 
                      href={`/animals/${animal.animal_id}/edit`} 
                      className="block w-full text-center bg-[#f8f7f2] text-sol-dark py-3 rounded-xl text-xs font-bold hover:bg-sol-yellow hover:text-sol-dark transition-colors border border-sol-dark/10 shadow-sm"
                    >
                      <i className="ti ti-edit mr-1"></i> Edit Animal Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}