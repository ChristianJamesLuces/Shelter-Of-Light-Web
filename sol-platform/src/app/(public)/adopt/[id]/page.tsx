import { getAnimalById } from '@/services/animals';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AnimalProfile({ params }: { params: { id: string } }) {
  const animal = await getAnimalById(params.id);

  if (!animal) {
    notFound(); 
  }

  const primaryPhoto = animal.animal_photos?.find((p: any) => p.is_primary)?.file_url 
    || 'https://via.placeholder.com/800x600?text=No+Photo';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Back to Gallery Link */}
      <Link href="/adopt" className="text-sm font-bold text-sol-dark/50 hover:text-sol-yellow mb-8 inline-block transition-colors">
        &larr; Back to all animals
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Side: Photo Gallery */}
        <div className="md:w-1/2 bg-gray-200 relative">
          <img 
            src={primaryPhoto} 
            alt={animal.name} 
            className="w-full h-full object-cover min-h-[400px] md:absolute md:inset-0"
          />
          {/* Status Badge floating on image */}
          <span className="absolute top-6 left-6 bg-sol-yellow text-sol-dark text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
            {animal.adoption_status === 'available' ? 'Available for Adoption' : animal.adoption_status}
          </span>
        </div>

        {/* Right Side: Comprehensive Details 
            FIX: Moved max-h and overflow strictly to the 'md:' (desktop) breakpoint 
        */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col md:max-h-[800px] md:overflow-y-auto">
          
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-sol-dark mb-1">{animal.name}</h1>
            <p className="text-sol-dark/50 text-sm font-medium tracking-wide">
              Shelter ID: {animal.animal_id?.toString().padStart(5, '0')}
            </p>
          </div>

          {/* 1. Basic Identity Quick Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 border-y border-sol-dark/10 py-6">
            <div className="bg-sol-cream/30 border border-sol-dark/5 px-3 py-2 rounded-lg">
              <span className="text-sol-dark/40 block text-[9px] uppercase font-bold tracking-wider">Species</span>
              <span className="font-medium text-sol-dark text-sm capitalize">{animal.species}</span>
            </div>
            <div className="bg-sol-cream/30 border border-sol-dark/5 px-3 py-2 rounded-lg">
              <span className="text-sol-dark/40 block text-[9px] uppercase font-bold tracking-wider">Sex</span>
              <span className="font-medium text-sol-dark text-sm capitalize">{animal.sex}</span>
            </div>
            <div className="bg-sol-cream/30 border border-sol-dark/5 px-3 py-2 rounded-lg">
              <span className="text-sol-dark/40 block text-[9px] uppercase font-bold tracking-wider">Age</span>
              <span className="font-medium text-sol-dark text-sm capitalize">{animal.age_estimate || 'Unknown'}</span>
            </div>
            <div className="bg-sol-cream/30 border border-sol-dark/5 px-3 py-2 rounded-lg col-span-2">
              <span className="text-sol-dark/40 block text-[9px] uppercase font-bold tracking-wider">Breed</span>
              <span className="font-medium text-sol-dark text-sm capitalize truncate">{animal.breed || 'Mixed Breed'}</span>
            </div>
            <div className="bg-sol-cream/30 border border-sol-dark/5 px-3 py-2 rounded-lg">
              <span className="text-sol-dark/40 block text-[9px] uppercase font-bold tracking-wider">Color</span>
              <span className="font-medium text-sol-dark text-sm capitalize truncate">{animal.color || 'Not Listed'}</span>
            </div>
          </div>

          {/* 2. Behavior, Personality & Compatibility */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-sol-dark mb-3 flex items-center gap-2">
              <i className="ti ti-mood-smile text-sol-yellow text-xl"></i> Personality & Compatibility
            </h2>
            {animal.temperament && (
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-sol-dark block mb-1">Temperament:</span> 
                {animal.temperament}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {animal.good_with_cats === 'yes' && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-md border border-blue-100 font-medium">✓ Good with Cats</span>
              )}
              {animal.good_with_dogs === 'yes' && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-md border border-blue-100 font-medium">✓ Good with Dogs</span>
              )}
              {animal.good_with_children && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-md border border-blue-100 font-medium">✓ Good with Children</span>
              )}
            </div>
          </div>

          {/* 3. Health & Medical Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-sol-dark mb-3 flex items-center gap-2">
              <i className="ti ti-heartbeat text-sol-yellow text-xl"></i> Health & Vetting
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {animal.kapon_status && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md border border-green-100 font-medium">Spayed/Neutered</span>
              )}
              {animal.vaccine_status && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md border border-green-100 font-medium">Vaccinated</span>
              )}
              {animal.deworming_status && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md border border-green-100 font-medium">Dewormed</span>
              )}
              {animal.flea_treatment_status && (
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-md border border-green-100 font-medium">Flea Treated</span>
              )}
            </div>

            {animal.medical_history && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-sol-dark block mb-1">Medical History:</span>
                <span className="whitespace-pre-wrap">{animal.medical_history}</span>
              </div>
            )}
          </div>

          {/* 4. Special Needs & Diet */}
          {(animal.special_needs || animal.diet_restrictions) && (
            <div className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-xl">
              <h2 className="text-sm font-bold text-orange-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg"></i> Special Care Required
              </h2>
              <div className="space-y-2 text-sm text-orange-800">
                {animal.special_needs && (
                  <p><strong className="font-semibold">Needs:</strong> {animal.special_needs}</p>
                )}
                {animal.diet_restrictions && (
                  <p><strong className="font-semibold">Diet:</strong> {animal.diet_restrictions}</p>
                )}
              </div>
            </div>
          )}

          {/* 5. Backstory */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-sol-dark mb-2">My Rescue Story</h2>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
              {animal.backstory || 'Our team is still getting to know me. Please contact the shelter to learn more about my story!'}
            </p>
          </div>

          {/* Action Buttons 
              FIX: Removed 'sticky bottom-0' so they flow naturally beneath the content. 
              Added 'md:mt-auto mt-8' to ensure spacing. 
          */}
          <div className="mt-8 md:mt-auto pt-6 border-t border-sol-dark/10 flex flex-col sm:flex-row gap-4 bg-white">
            <Link 
              href={`/adopt/${animal.animal_id}/apply`}
              className="flex-1 bg-sol-dark text-sol-yellow text-center py-4 rounded-lg font-bold text-base hover:bg-black transition-colors shadow-md block"
            >
              Apply to Adopt
            </Link>
            
            <Link 
              href="/donate"
              className="flex-1 bg-sol-yellow text-sol-dark text-center py-4 rounded-lg font-bold text-base hover:bg-yellow-400 transition-colors shadow-md block"
            >
              Sponsor & Donate
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}