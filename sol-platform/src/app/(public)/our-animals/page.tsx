'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function OurAnimalsPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for the Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // New filter for status!

  useEffect(() => {
    async function fetchAllAnimals() {
      // Notice there is NO .eq() filter here, so it fetches EVERY animal in the shelter
      const { data, error } = await supabase
        .from('animals')
        .select(`*, animal_photos(file_url)`)
        .order('date_taken_in', { ascending: false });

      if (data) {
        setAnimals(data);
      }
      setIsLoading(false);
    }
    fetchAllAnimals();
  }, []);

  // Filter the grid based on search text AND both dropdowns
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || animal.species.toLowerCase() === speciesFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || animal.adoption_status === statusFilter;
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  // Helper function to color-code the status badges
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available': 
        return <span className="absolute top-4 left-4 bg-sol-yellow text-sol-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Available</span>;
      case 'on_hold': 
        return <span className="absolute top-4 left-4 bg-orange-200 text-orange-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">On Hold</span>;
      case 'adopted': 
        return <span className="absolute top-4 left-4 bg-green-200 text-green-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Adopted</span>;
      case 'sanctuary': 
        return <span className="absolute top-4 left-4 bg-purple-200 text-purple-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">Sanctuary</span>;
      default:
        return <span className="absolute top-4 left-4 bg-gray-200 text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      
      {/* Header section */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-sol-dark font-bold mb-1">Meet our shelter family</h1>
        <p className="text-sol-dark/60 text-sm">Get to know all {filteredAnimals.length} of our amazing rescues</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-sol-dark/10 focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm"
          />
        </div>
        
        <select 
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-sol-dark/10 bg-white min-w-[160px] focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all cursor-pointer text-sm"
        >
          <option value="All">All Species</option>
          <option value="Cat">Cats</option>
          <option value="Dog">Dogs</option>
        </select>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-sol-dark/10 bg-white min-w-[160px] focus:outline-none focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all cursor-pointer text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_hold">On Hold</option>
          <option value="sanctuary">Sanctuary</option>
          <option value="adopted">Adopted</option>
        </select>
      </div>

      {/* Loading & Empty States */}
      {isLoading ? (
        <div className="text-center text-sol-dark/50 py-12">Loading shelter family...</div>
      ) : filteredAnimals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-sol-dark/10">
          <h3 className="text-lg font-bold text-sol-dark mb-2">No matches found</h3>
          <p className="text-sm text-sol-dark/60">Try adjusting your search or filters.</p>
        </div>
      ) : (
        /* Animal Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => {
            const photoUrl = animal.animal_photos?.[0]?.file_url;

            return (
              <div key={animal.animal_id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sol-dark/10 hover:shadow-md transition-shadow flex flex-col h-full">
                
                {/* Top Half: Dark Photo Background */}
                <div className="h-56 bg-sol-dark relative overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={animal.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sol-yellow/30">
                      <i className="ti ti-paw text-5xl"></i>
                    </div>
                  )}
                  {/* Dynamic Status Badge */}
                  {getStatusBadge(animal.adoption_status)}
                </div>
                
                {/* Bottom Half: Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-sol-dark text-2xl mb-1">{animal.name}</h3>
                  <p className="text-sm text-sol-dark/60 capitalize">
                    {animal.age_estimate} • {animal.sex}
                  </p>

                  <div className="mt-auto pt-5">
                    <Link 
                      href={`/adopt/${animal.animal_id}`}
                      className="inline-flex items-center justify-center w-full bg-sol-dark/5 text-sol-dark py-2.5 rounded-lg font-bold text-xs hover:bg-sol-yellow transition-colors"
                    >
                      Read My Story
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