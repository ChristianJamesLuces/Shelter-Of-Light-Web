import Link from 'next/link';

// Typing the data based on your v_available_animals view
type AnimalProps = {
  animal_id: number;
  name: string;
  species: string;
  sex: string;
  age_estimate: string | null;
  primary_photo_url: string | null;
};

export default function AnimalCard({ animal }: { animal: AnimalProps }) {
  // Fallback image if no photo exists yet
  const photoUrl = animal.primary_photo_url || 'https://via.placeholder.com/400x300?text=No+Photo';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-56 w-full bg-gray-200">
        <img 
          src={photoUrl} 
          alt={animal.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-sol-dark">{animal.name}</h3>
          <span className="bg-sol-yellow text-sol-dark text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
            Available
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 capitalize flex-grow">
          {animal.sex} • {animal.species} • {animal.age_estimate || 'Unknown age'}
        </p>
        <Link 
          href={`/animals/${animal.animal_id}`}
          className="block w-full text-center bg-sol-dark text-sol-cream py-2 rounded font-medium hover:bg-gray-800 transition-colors"
        >
          Meet {animal.name}
        </Link>
      </div>
    </div>
  );
}