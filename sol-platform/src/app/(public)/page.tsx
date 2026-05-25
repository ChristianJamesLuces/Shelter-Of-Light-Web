import { getAvailableAnimals } from '@/services/animals';
import Link from 'next/link';

export default async function Home() {
  // Fetch live data from your Supabase database!
  const animals = await getAvailableAnimals();
  
  // For the homepage, let's just show the latest 4 animals
  const featuredAnimals = animals.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      
      {/* HERO SECTION */}
      <section className="bg-sol-dark pt-24 pb-12 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-block bg-sol-yellow/10 border border-sol-yellow/30 text-sol-yellow text-[10px] tracking-widest px-3 py-1 rounded-full mb-6 font-bold">
            METRO MANILA · ANIMAL RESCUE SHELTER
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Every animal deserves <br className="hidden sm:block" />
            a <em className="text-sol-yellow italic pr-2">loving</em> home
          </h1>
          
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            We rescue, rehabilitate, and rehome animals across Metro Manila. Find your forever companion today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/our-animals" className="bg-sol-yellow text-sol-dark px-8 py-3 rounded-full font-bold text-sm hover:bg-yellow-400 transition-colors">
            Meet Our Animals &rarr;
          </Link>
            <Link href="/about" className="border border-white/20 text-white/80 px-8 py-3 rounded-full font-medium text-sm hover:bg-white/10 transition-colors">
              How to adopt
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-sol-yellow grid grid-cols-3 divide-x divide-sol-dark/15 border-y border-sol-dark">
        {[
          ['400+', 'Cats rescued'],
          ['23', 'Dogs rescued'],
          ['5 yrs', 'Of shelter love']
        ].map(([stat, label], idx) => (
          <div key={idx} className="py-6 text-center">
            <div className="font-serif text-3xl md:text-4xl font-bold text-sol-dark">{stat}</div>
            <div className="text-[11px] md:text-xs text-sol-dark/70 mt-1 font-medium tracking-wide uppercase">{label}</div>
          </div>
        ))}
      </section>

      {/* FEATURED ANIMALS SECTION */}
      <section className="bg-sol-cream py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-serif text-3xl font-bold text-sol-dark">Ready to be adopted</h2>
          <Link href="/adopt" className="text-sm text-sol-dark/60 hover:text-sol-dark font-medium transition-colors">
            View all &rarr;
          </Link>
        </div>

        {/* Database-Driven Grid */}
        {featuredAnimals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-sol-dark/10">
            <p className="text-sol-dark/60">No animals are currently available. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredAnimals.map((animal) => {
              const photoUrl = animal.primary_photo_url || 'https://via.placeholder.com/400x400?text=No+Photo';
              return (
                <Link href={`/adopt/${animal.animal_id}`} key={animal.animal_id} className="group bg-white rounded-2xl border border-sol-dark/10 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-sol-dark relative overflow-hidden">
                    <img src={photoUrl} alt={animal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-sol-yellow text-sol-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {animal.adoption_status}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="font-serif text-xl font-bold text-sol-dark">{animal.name}</div>
                    <div className="text-xs text-sol-dark/60 mt-1 capitalize">
                      {animal.sex} &middot; {animal.breed || 'Mixed'} &middot; {animal.age_estimate}
                    </div>
                    {/* Compatibility Tags */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {animal.good_with_cats === 'yes' && <span className="bg-[#f0f0e8] text-sol-dark/70 text-[10px] px-2 py-1 rounded-md font-medium">Good w/ cats</span>}
                      {animal.good_with_dogs === 'yes' && <span className="bg-[#f0f0e8] text-sol-dark/70 text-[10px] px-2 py-1 rounded-md font-medium">Good w/ dogs</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* DONATION CTA */}
      <section className="bg-sol-dark py-20 px-6 text-center border-t border-sol-dark">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
          Help us care for every <em className="text-sol-yellow not-italic">star</em>
        </h2>
        <p className="text-white/60 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Your donations go directly to food, vet bills, medicine, and daily care for our rescued animals.
        </p>
        
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {['GCash', 'PayMaya', 'PayPal', 'BDO'].map(method => (
            <span key={method} className="bg-white/5 border border-white/10 text-white/70 text-xs px-4 py-2 rounded-full">
              {method}
            </span>
          ))}
        </div>
        
        <Link href="/donate" className="inline-block bg-sol-yellow text-sol-dark px-8 py-3 rounded-full font-bold text-sm hover:bg-yellow-400 transition-colors">
          Donate now
        </Link>
      </section>

    </div>
  );
}