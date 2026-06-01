'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AnimalsPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for search and dual-filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');

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

  // FOOLPROOF STATUS PARSER
  const normalizeStatus = (status: string | null) => {
    if (!status) return 'available';
    const s = status.toLowerCase();
    if (s.includes('hold')) return 'on hold';
    if (s.includes('sanctuary')) return 'sanctuary resident';
    if (s.includes('adopt')) return 'adopted';
    return 'available';
  };

  // Calculate dynamic stats
  const stats = {
    total: animals.length,
    dogs: animals.filter(a => (a.species || '').toLowerCase() === 'dog').length,
    cats: animals.filter(a => (a.species || '').toLowerCase() === 'cat').length,
    available: animals.filter(a => normalizeStatus(a.adoption_status) === 'available').length,
    adopted: animals.filter(a => normalizeStatus(a.adoption_status) === 'adopted').length,
    onHold: animals.filter(a => normalizeStatus(a.adoption_status) === 'on hold').length,
    sanctuary: animals.filter(a => normalizeStatus(a.adoption_status) === 'sanctuary resident').length,
  };

  // Filter logic (Checks Search AND Status AND Species simultaneously)
  const filteredAnimals = animals.filter(animal => {
    const status = normalizeStatus(animal.adoption_status);
    const species = (animal.species || '').toLowerCase();
    
    const matchesSearch = (animal.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          species.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();
    const matchesSpecies = speciesFilter === 'All' || species === speciesFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const isAll = statusFilter === 'All' && speciesFilter === 'All';

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-[1600px] mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 flex justify-between items-start sm:items-end gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-sol-dark mb-1 sm:mb-2">Inventory</h1>
          <p className="text-sol-dark/60 text-xs sm:text-sm">Manage all rescues and their current adoption statuses.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchAnimals} 
            disabled={isLoading} 
            className="text-[10px] sm:text-sm font-bold bg-white border border-sol-dark/10 text-sol-dark hover:bg-sol-cream px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 sm:gap-2 shadow-sm disabled:opacity-50"
          >
            <i className={`ti ti-refresh text-sm sm:text-lg ${isLoading ? 'animate-spin' : ''}`}></i> 
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <Link 
            href="/animals/new" 
            className="bg-sol-dark text-sol-yellow px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm hover:bg-black transition-colors shadow-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap"
          >
            <i className="ti ti-plus"></i> Add <span className="hidden sm:inline">New Animal</span>
          </Link>
        </div>
      </div>

      {/* HIGHLIGHTS SECTION: 2 Rows */}
      <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-4">
        
        {/* Row 1: Totals (Forced 3 in a row) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button 
            onClick={() => { setStatusFilter('All'); setSpeciesFilter('All'); }} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${isAll ? 'bg-sol-dark text-sol-yellow border-sol-dark shadow-md sm:scale-[1.02]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-sol-dark shadow-sm'}`}
          >
            <div className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${isAll ? 'text-sol-yellow/80' : 'text-gray-500'}`}>Total<span className="hidden sm:inline"> Animals</span></div>
            <div className="text-sm sm:text-2xl font-serif font-bold">{stats.total}</div>
          </button>

          <button 
            onClick={() => setSpeciesFilter('dog')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${speciesFilter === 'dog' ? 'bg-orange-500 text-white border-orange-600 shadow-md sm:scale-[1.02]' : 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-900 shadow-sm'}`}
          >
            <div className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${speciesFilter === 'dog' ? 'text-white/80' : 'text-orange-600/80'}`}>Dogs</div>
            <div className="text-sm sm:text-2xl font-serif font-bold">{stats.dogs}</div>
          </button>

          <button 
            onClick={() => setSpeciesFilter('cat')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${speciesFilter === 'cat' ? 'bg-indigo-500 text-white border-indigo-600 shadow-md sm:scale-[1.02]' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900 shadow-sm'}`}
          >
            <div className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${speciesFilter === 'cat' ? 'text-white/80' : 'text-indigo-600/80'}`}>Cats</div>
            <div className="text-sm sm:text-2xl font-serif font-bold">{stats.cats}</div>
          </button>
        </div>

        {/* Row 2: Statuses (Forced 4 in a row) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <button 
            onClick={() => setStatusFilter('available')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${statusFilter === 'available' ? 'bg-blue-500 text-white border-blue-600 shadow-md sm:scale-[1.02]' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900 shadow-sm'}`}
          >
            <div className={`text-[7px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${statusFilter === 'available' ? 'text-white/80' : 'text-blue-600/80'}`}>Avail<span className="hidden sm:inline">able</span></div>
            <div className="text-xs sm:text-2xl font-serif font-bold">{stats.available}</div>
          </button>
          
          <button 
            onClick={() => setStatusFilter('on hold')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${statusFilter === 'on hold' ? 'bg-amber-500 text-white border-amber-600 shadow-md sm:scale-[1.02]' : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900 shadow-sm'}`}
          >
            <div className={`text-[7px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${statusFilter === 'on hold' ? 'text-white/80' : 'text-amber-600/80'}`}>Hold</div>
            <div className="text-xs sm:text-2xl font-serif font-bold">{stats.onHold}</div>
          </button>

          <button 
            onClick={() => setStatusFilter('sanctuary resident')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${statusFilter === 'sanctuary resident' ? 'bg-purple-500 text-white border-purple-600 shadow-md sm:scale-[1.02]' : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900 shadow-sm'}`}
          >
            <div className={`text-[7px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${statusFilter === 'sanctuary resident' ? 'text-white/80' : 'text-purple-600/80'}`}>Sanct<span className="hidden sm:inline">uary</span></div>
            <div className="text-xs sm:text-2xl font-serif font-bold">{stats.sanctuary}</div>
          </button>

          <button 
            onClick={() => setStatusFilter('adopted')} 
            className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all ${statusFilter === 'adopted' ? 'bg-green-500 text-white border-green-600 shadow-md sm:scale-[1.02]' : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900 shadow-sm'}`}
          >
            <div className={`text-[7px] sm:text-[10px] uppercase tracking-wider font-bold mb-0.5 sm:mb-1 ${statusFilter === 'adopted' ? 'text-white/80' : 'text-green-600/80'}`}>Adopt<span className="hidden sm:inline">ed</span></div>
            <div className="text-xs sm:text-2xl font-serif font-bold">{stats.adopted}</div>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar (Forced on the same row) */}
      <div className="flex flex-row gap-2 w-full mb-4 sm:mb-6">
        <div className="relative flex-[2] min-w-0">
          <i className="ti ti-search absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-xs sm:text-base"></i>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none shadow-sm"
          />
        </div>
        
        {/* Dual Select Menus */}
        <select 
          value={speciesFilter} 
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="flex-[1] min-w-0 px-1 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[9px] sm:text-sm outline-none shadow-sm cursor-pointer"
        >
          <option value="All">Species</option>
          <option value="dog">Dogs</option>
          <option value="cat">Cats</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-[1] min-w-0 px-1 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-sol-dark/10 focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[9px] sm:text-sm outline-none shadow-sm cursor-pointer"
        >
          <option value="All">Status</option>
          <option value="available">Available</option>
          <option value="on hold">On Hold</option>
          <option value="sanctuary resident">Sanctuary</option>
          <option value="adopted">Adopted</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-sol-dark/50">
          <i className="ti ti-loader animate-spin text-4xl text-sol-yellow"></i>
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sol-dark/10 p-16 text-center shadow-sm mt-4 sm:mt-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sol-yellow/20 rounded-full flex items-center justify-center text-sol-yellow mx-auto mb-4">
            <i className="ti ti-paw text-2xl sm:text-3xl"></i>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-sol-dark mb-2">No Animals Found</h2>
          <p className="text-xs sm:text-sm text-sol-dark/60">Try adjusting your filters or search query.</p>
          {!isAll && (
            <button onClick={() => { setStatusFilter('All'); setSpeciesFilter('All'); }} className="mt-4 text-sol-yellow font-bold text-xs sm:text-sm hover:underline">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* THE ANIMAL GRID: Forced 3 columns on mobile, scaling up to 5 on large screens */
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
          {filteredAnimals.map((animal) => {
            const photoUrl = animal.animal_photos?.[0]?.file_url;
            const status = normalizeStatus(animal.adoption_status);
            
            let badgeStyle = 'bg-white text-sol-dark border border-sol-dark/10';
            let badgeText = 'Available';
            if (status === 'adopted') { badgeStyle = 'bg-green-100 text-green-700 border border-green-200'; badgeText = 'Adopted'; }
            if (status === 'on hold') { badgeStyle = 'bg-amber-100 text-amber-700 border border-amber-200'; badgeText = 'On Hold'; }
            if (status === 'sanctuary resident') { badgeStyle = 'bg-purple-100 text-purple-700 border border-purple-200'; badgeText = 'Sanctuary'; }
            if (status === 'available') { badgeStyle = 'bg-blue-50 text-blue-700 border border-blue-200'; badgeText = 'Available'; }
            
            return (
              <div key={animal.animal_id} className="bg-white rounded-xl sm:rounded-2xl border border-sol-dark/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-20 sm:h-48 bg-sol-cream relative overflow-hidden flex-shrink-0 border-b border-sol-dark/5">
                  {photoUrl ? (
                    <img src={photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sol-dark/20">
                      <i className="ti ti-photo text-2xl sm:text-4xl"></i>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-1 sm:top-3 right-1 sm:right-3">
                    <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[7px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 sm:p-5 flex flex-col flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-1 sm:mb-2 gap-0.5 sm:gap-2 overflow-hidden">
                    <h3 className="font-bold text-[10px] sm:text-lg text-sol-dark truncate w-full">{animal.name}</h3>
                    <span className="text-[7px] sm:text-[10px] text-sol-dark/60 font-bold uppercase tracking-wider bg-sol-dark/5 px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm sm:rounded-md flex-shrink-0">
                      {animal.species}
                    </span>
                  </div>
                  
                  <div className="text-[8px] sm:text-xs text-sol-dark/60 mb-2 sm:mb-6 space-y-0.5 sm:space-y-1.5">
                    <div className="flex justify-between border-b border-sol-dark/5 pb-0.5 sm:pb-1">
                      <span className="font-medium opacity-70">Age</span> 
                      <span className="text-sol-dark font-medium truncate max-w-[40px] sm:max-w-none text-right">{animal.age_estimate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium opacity-70">Sex</span> 
                      <span className="text-sol-dark font-medium capitalize">{animal.sex || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <Link 
                      href={`/animals/${animal.animal_id}/edit`} 
                      className="block w-full text-center bg-[#f8f7f2] text-sol-dark py-1.5 sm:py-3 rounded-md sm:rounded-xl text-[8px] sm:text-xs font-bold hover:bg-sol-yellow hover:text-sol-dark transition-colors border border-sol-dark/10 shadow-sm"
                    >
                      <i className="ti ti-edit hidden sm:inline-block mr-1"></i> Edit<span className="hidden sm:inline"> Profile</span>
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