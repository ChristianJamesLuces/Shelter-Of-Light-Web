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
          <div className="inline-block bg-sol-yellow/10 border border-sol-yellow/30 text-sol-yellow text-[10px] tracking-widest px-3 py-1 rounded-full mb-6 font-bold uppercase">
            QUEZON CITY · ANIMAL RESCUE SHELTER
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Every animal deserves <br className="hidden sm:block" />
            a <em className="text-sol-yellow italic pr-2">loving</em> home
          </h1>
          
          {/* THE NEW TAGLINE */}
          <h2 className="text-sol-yellow/90 text-xl md:text-2xl font-serif italic mb-8">
            "The Light We Carry: Our Journey"
          </h2>
          
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            We rescue, rehabilitate, and rehome animals across Quezon City. Find your forever companion today.
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
          ['5 yrs', 'Of shelter light']
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
              
              // THE FIX: We now explicitly look inside the nested 'animal_photos' array from Supabase
              const photoUrl = animal.animal_photos?.[0]?.file_url || animal.primary_photo_url || 'https://placehold.co/400x400?text=No+Photo';
              
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
        
        {/* INTERACTIVE DONATION LINKS */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          <Link href="/donate#gcash" className="bg-white/5 border border-white/10 text-white/90 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-white/10 hover:border-sol-yellow/50 transition-colors">
            GCash
          </Link>
          <Link href="/donate#maya" className="bg-white/5 border border-white/10 text-white/90 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-white/10 hover:border-sol-yellow/50 transition-colors">
            Maya
          </Link>
          <Link href="/donate#paypal" className="bg-white/5 border border-white/10 text-white/90 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-white/10 hover:border-sol-yellow/50 transition-colors">
            PayPal
          </Link>
          <Link href="/donate#bdo" className="bg-white/5 border border-white/10 text-white/90 font-medium text-sm px-6 py-2.5 rounded-full hover:bg-white/10 hover:border-sol-yellow/50 transition-colors">
            BDO
          </Link>
        </div>
        
        <Link href="/donate" className="inline-block bg-sol-yellow text-sol-dark px-10 py-3.5 rounded-full font-bold text-sm hover:bg-yellow-400 transition-colors shadow-lg">
          Make a Donation Today
        </Link>
      </section>

      {/* REACH OUT / CONTACT SECTION */}
      <section className="py-20 bg-[#f8f7f2]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-sol-dark mb-4">Connect with us</h2>
          <p className="text-sol-dark/70 mb-10 max-w-2xl mx-auto">
            Have questions about adoption, volunteering, or donations? We would love to hear from you. Reach out through any of our official channels below!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://facebook.com/shelteroflightph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white text-[#1877F2] border border-[#1877F2]/20 px-6 py-4 rounded-xl font-bold hover:bg-[#1877F2]/10 transition-colors shadow-sm">
              <i className="ti ti-brand-facebook text-2xl"></i> Facebook
            </a>
            <a href="https://instagram.com/shelteroflightph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white text-pink-600 border border-pink-200 px-6 py-4 rounded-xl font-bold hover:bg-pink-50 transition-colors shadow-sm">
              <i className="ti ti-brand-instagram text-2xl"></i> Instagram
            </a>
            <a href="https://tiktok.com/@shelteroflight" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white text-gray-800 border border-gray-200 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm">
              <i className="ti ti-brand-tiktok text-2xl"></i> TikTok
            </a>
            <a href="https://youtube.com/@shelteroflightph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white text-red-600 border border-red-200 px-6 py-4 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-sm">
              <i className="ti ti-brand-youtube text-2xl"></i> YouTube
            </a>
            <a href="mailto:shelteroflightph@gmail.com" className="flex items-center gap-3 bg-sol-dark text-sol-yellow px-6 py-4 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">
              <i className="ti ti-mail text-2xl"></i> Email Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}