'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminAnimalInventory() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAnimals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*, animal_photos(file_url)')
      .order('date_taken_in', { ascending: false });

    if (error) {
      console.error('Error fetching animals:', error);
    } else if (data) {
      setAnimals(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  // Filter logic for the table
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          animal.animal_id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || animal.adoption_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-sol-dark">Animal Inventory</h1>
          <p className="text-sol-dark/60 mt-1">Manage shelter records, statuses, and profiles.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={fetchAnimals} className="p-2.5 text-sol-dark/50 hover:text-sol-dark bg-white border border-sol-dark/10 rounded-xl transition-colors shadow-sm">
            <i className="ti ti-refresh text-lg"></i>
          </button>
          <Link 
            href="/animals/new" 
            className="flex-1 md:flex-none bg-sol-yellow text-sol-dark px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <i className="ti ti-plus"></i> Add New Animal
          </Link>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-sol-dark/10 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40"></i>
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-sol-dark/10 focus:outline-none focus:border-sol-yellow text-sm"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-sol-dark/10 bg-[#f8f7f2] focus:outline-none focus:border-sol-yellow text-sm font-medium text-sol-dark cursor-pointer min-w-[160px]"
        >
          <option value="All">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_hold">On Hold</option>
          <option value="adopted">Adopted</option>
          <option value="sanctuary">Sanctuary</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-sol-dark/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sol-cream/50 border-b border-sol-dark/10 text-xs uppercase tracking-wider text-sol-dark/50 font-bold">
                <th className="px-6 py-4">Animal</th>
                <th className="px-6 py-4">Species & Age</th>
                <th className="px-6 py-4">Intake Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sol-dark/5">
              
              {isLoading && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sol-dark/50">Loading inventory...</td></tr>
              )}

              {!isLoading && filteredAnimals.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sol-dark/50">No animals found matching your search.</td></tr>
              )}

              {!isLoading && filteredAnimals.map((animal) => {
                const photoUrl = animal.animal_photos?.[0]?.file_url;
                const dateStr = new Date(animal.date_taken_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <tr key={animal.animal_id} className="hover:bg-sol-cream/30 transition-colors group">
                    
                    {/* Column 1: Photo & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#f8f7f2] border border-sol-dark/10 overflow-hidden shrink-0">
                          {photoUrl ? (
                            <img src={photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sol-dark/20"><i className="ti ti-paw"></i></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sol-dark text-sm">{animal.name}</div>
                          <div className="text-[10px] text-sol-dark/40 font-mono tracking-wider">ID: {animal.animal_id.toString().padStart(5, '0')}</div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-sol-dark capitalize">{animal.species} • {animal.sex}</div>
                      <div className="text-xs text-sol-dark/50">{animal.age_estimate || 'Unknown age'}</div>
                    </td>

                    {/* Column 3: Date */}
                    <td className="px-6 py-4 text-sm text-sol-dark/70">
                      {dateStr}
                    </td>

                    {/* Column 4: Status */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border ${
                        animal.adoption_status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                        animal.adoption_status === 'on_hold' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        animal.adoption_status === 'adopted' ? 'bg-sol-dark text-sol-yellow border-sol-dark' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {animal.adoption_status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="px-6 py-4 text-right">
                      {/* THIS IS THE LINK THAT CONNECTS TO YOUR NEW EDIT PAGE */}
                      <Link 
                        href={`/animals/${animal.animal_id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sol-dark/40 hover:text-sol-yellow transition-colors border border-transparent hover:border-sol-yellow/30 bg-transparent hover:bg-sol-yellow/10 px-3 py-1.5 rounded-lg"
                      >
                        <i className="ti ti-edit"></i> Manage
                      </Link>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}