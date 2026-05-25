'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AnimalsInventoryPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimals() {
      // Fetch all animals and their primary photo
      const { data, error } = await supabase
        .from('animals')
        .select(`
          *,
          animal_photos ( file_url )
        `)
        .order('date_taken_in', { ascending: false });

      if (error) {
        console.error('Error fetching animals:', error);
      } else if (data) {
        setAnimals(data);
      }
      setIsLoading(false);
    }

    fetchAnimals();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-sol-dark font-bold">Animal Inventory</h1>
          <p className="text-xs text-sol-dark/50 mt-1">Manage shelter animals and update their profiles.</p>
        </div>
        <Link 
          href="/animals/new" 
          className="bg-sol-yellow text-sol-dark px-4 py-2 rounded-full text-xs font-bold hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-1"
        >
          <i className="ti ti-plus text-sm"></i> Add animal
        </Link>
      </div>

      {/* Grid of Animals */}
      {isLoading ? (
        <div className="text-center text-sm text-sol-dark/50 py-12">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals.map((animal) => {
            // Check if there is a photo, otherwise use a placeholder
            const photoUrl = animal.animal_photos?.[0]?.file_url;

            return (
              <div key={animal.animal_id} className="bg-white rounded-xl border border-sol-dark/10 overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 bg-[#f8f7f2] relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sol-dark/20 text-4xl font-bold">
                      {animal.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    animal.adoption_status === 'available' ? 'bg-green-100 text-green-800' :
                    animal.adoption_status === 'adopted' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {animal.adoption_status.toUpperCase()}
                  </span>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sol-dark text-lg">{animal.name}</h3>
                  <p className="text-xs text-sol-dark/60 capitalize mb-4">
                    {animal.species} • {animal.sex} • {animal.age_estimate}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-sol-dark/10 flex justify-between items-center">
                    <span className="text-[10px] text-sol-dark/40">ID: {animal.animal_id}</span>
                    <Link 
                        href={`/animals/${animal.animal_id}/edit`}
                        className="text-xs font-bold text-sol-dark hover:text-sol-yellow transition-colors underline"
                        >
                        Manage Profile &rarr;
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