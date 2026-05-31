'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AnimalsInventoryPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setAnimals(data);
    if (error) console.error("Error fetching animals:", error);
    setIsLoading(false);
  };

  // Helper to change the animal's status quickly from the dropdown
  const updateStatus = async (animalId: string, newStatus: string) => {
    const { error } = await supabase
      .from('animals')
      .update({ adoption_status: newStatus })
      .eq('animal_id', animalId);

    if (!error) {
      setAnimals(animals.map(a => a.animal_id === animalId ? { ...a, adoption_status: newStatus } : a));
    } else {
      alert("Error updating status. Check database permissions.");
    }
  };

  const filteredAnimals = animals.filter(animal => {
    if (filter === 'all') return true;
    return animal.adoption_status?.toLowerCase() === filter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Animal Inventory</h1>
          <p className="text-sol-dark/60 text-sm">Manage shelter residents, medical alerts, and adoption statuses.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-sol-dark/10 rounded-xl text-sm font-medium text-sol-dark outline-none focus:border-sol-yellow shadow-sm"
          >
            <option value="all">All Residents</option>
            <option value="available">Available</option>
            <option value="on hold">On Hold</option>
            <option value="adopted">Adopted</option>
            <option value="permanent sanctuary resident">Sanctuary Residents</option>
          </select>

          <Link href="/dashboard/animals/new" className="bg-sol-dark text-sol-yellow px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-sm flex items-center gap-2">
            <i className="ti ti-plus"></i> Add Animal
          </Link>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-sol-dark/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-sol-dark/50">
            <i className="ti ti-loader animate-spin text-4xl mb-3 block text-sol-yellow"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/10 text-[10px] uppercase tracking-wider text-sol-dark/50 font-bold">
                  <th className="px-6 py-4">Name & Details</th>
                  <th className="px-6 py-4">Medical Status</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.animal_id} className="hover:bg-sol-cream/20 transition-colors group">
                    
                    {/* Basic Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${animal.species?.toLowerCase() === 'dog' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          <i className={`ti ti-${animal.species?.toLowerCase() === 'dog' ? 'dog' : 'cat'}`}></i>
                        </div>
                        <div>
                          <div className="font-bold text-sol-dark text-sm flex items-center gap-2">
                            {animal.name}
                            {animal.sex?.toLowerCase() === 'male' ? (
                              <i className="ti ti-gender-male text-blue-400 text-xs" title="Male"></i>
                            ) : (
                              <i className="ti ti-gender-female text-pink-400 text-xs" title="Female"></i>
                            )}
                          </div>
                          <div className="text-xs text-sol-dark/50 capitalize">
                            {animal.breed || 'Mixed Breed'} • {animal.age || 'Unknown Age'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Medical / Kapon Alerts */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {animal.is_neutered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700">
                            <i className="ti ti-check bg-green-100 p-0.5 rounded-full"></i> Neutered/Spayed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                            <i className="ti ti-alert-circle"></i> Needs Kapon
                          </span>
                        )}
                      </div>
                    </td>

                    {/* The Expanded Status Dropdown */}
                    <td className="px-6 py-4">
                      <select 
                        value={animal.adoption_status?.toLowerCase() || 'available'}
                        onChange={(e) => updateStatus(animal.animal_id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none text-center
                          ${animal.adoption_status?.toLowerCase() === 'available' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                          ${animal.adoption_status?.toLowerCase() === 'on hold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                          ${animal.adoption_status?.toLowerCase() === 'adopted' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                          ${animal.adoption_status?.toLowerCase() === 'permanent sanctuary resident' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        `}
                      >
                        <option value="available">Available</option>
                        <option value="on hold">On Hold</option>
                        <option value="adopted">Adopted</option>
                        <option value="permanent sanctuary resident">Sanctuary Resident</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/animals/${animal.animal_id}/edit`} className="text-sol-dark/30 hover:text-sol-yellow transition-colors p-2" title="Edit Full Profile">
                        <i className="ti ti-edit text-lg"></i>
                      </Link>
                    </td>

                  </tr>
                ))}

                {filteredAnimals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sol-dark/50 text-sm">
                      <i className="ti ti-paw-off text-3xl mb-2 block opacity-50"></i>
                      No animals match this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}