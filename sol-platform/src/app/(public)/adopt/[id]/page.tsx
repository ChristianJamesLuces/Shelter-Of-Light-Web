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
        <div className="md:w-1/2 bg-gray-200">
          <img 
            src={primaryPhoto} 
            alt={animal.name} 
            className="w-full h-full object-cover min-h-[400px]"
          />
        </div>

        {/* Right Side: Details & CTA */}
        <div className="md:w-1/2 p-8 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold text-sol-dark">{animal.name}</h1>
            <span className="bg-sol-yellow text-sol-dark px-3 py-1 rounded-full text-sm font-bold uppercase">
              {animal.adoption_status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-gray-700">
            <div><span className="font-semibold block text-sol-dark">Species</span> <span className="capitalize">{animal.species}</span></div>
            <div><span className="font-semibold block text-sol-dark">Sex</span> <span className="capitalize">{animal.sex}</span></div>
            <div><span className="font-semibold block text-sol-dark">Age</span> {animal.age_estimate || 'Unknown'}</div>
            <div><span className="font-semibold block text-sol-dark">Breed</span> {animal.breed || 'Mixed'}</div>
          </div>

          <div className="mb-8 flex-grow">
            <h2 className="text-xl font-bold text-sol-dark mb-2">About Me</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{animal.backstory || 'No backstory provided yet.'}</p>
            
            {animal.temperament && (
              <p className="mt-4 text-gray-600"><span className="font-semibold text-sol-dark">Temperament:</span> {animal.temperament}</p>
            )}
            
            <div className="mt-6 flex flex-wrap gap-2">
              {animal.kapon_status && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-200">Neutered/Spayed</span>
              )}
              {animal.good_with_cats === 'yes' && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">Good with Cats</span>
              )}
              {animal.good_with_dogs === 'yes' && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">Good with Dogs</span>
              )}
            </div>
          </div>

          {/* THE FIX: Action Buttons Side-by-Side */}
          <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-4">
            <Link 
              href={`/adopt/${animal.animal_id}/apply`}
              className="flex-1 bg-sol-dark text-sol-yellow text-center py-4 rounded-lg font-bold text-lg hover:bg-black transition-colors shadow-md block"
            >
              Apply to Adopt
            </Link>
            
            <Link 
              href="/donate"
              className="flex-1 bg-sol-yellow text-sol-dark text-center py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors shadow-md block"
            >
              Sponsor & Donate
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}