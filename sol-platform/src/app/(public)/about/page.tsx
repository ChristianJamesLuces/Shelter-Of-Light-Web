import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      
      {/* HERO SECTION */}
      <section className="bg-sol-dark pt-20 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            The Light We Carry: <br />
            <em className="text-sol-yellow italic">Our Journey</em>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Our mission is simple: to make sure rescued animals go only to responsible, loving owners, drastically reducing cases of neglect, abandonment, and unsafe environments.
          </p>
        </div>
      </section>

      {/* THE ADOPTION PROCESS SECTION */}
      <section className="py-20 px-6 bg-[#f8f7f2]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-sol-dark mb-4">Our Adoption Process</h2>
            <p className="text-sol-dark/60 max-w-2xl mx-auto">We take our adoption process seriously to ensure every animal finds their true forever home. Here is how it works.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sol-dark/5 relative mt-6 md:mt-0">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-sol-yellow text-sol-dark font-bold text-xl rounded-full flex items-center justify-center border-4 border-[#f8f7f2]">1</div>
              <h3 className="text-xl font-bold text-sol-dark mb-3 mt-4">Submit Application</h3>
              <p className="text-sm text-sol-dark/70 leading-relaxed">
                Browse our gallery of available animals and fill out a detailed adoption application form so we can get to know you, your lifestyle, and your home environment.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sol-dark/5 relative mt-6 md:mt-0">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-sol-yellow text-sol-dark font-bold text-xl rounded-full flex items-center justify-center border-4 border-[#f8f7f2]">2</div>
              <h3 className="text-xl font-bold text-sol-dark mb-3 mt-4">The Interview</h3>
              <p className="text-sm text-sol-dark/70 leading-relaxed">
                If the form looks good, we will schedule a video call interview. We may also ask for a virtual house tour or photos to verify that the environment is safe and secure for the animal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sol-dark/5 relative mt-6 md:mt-0">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-sol-yellow text-sol-dark font-bold text-xl rounded-full flex items-center justify-center border-4 border-[#f8f7f2]">3</div>
              <h3 className="text-xl font-bold text-sol-dark mb-3 mt-4">Adoption Proper</h3>
              <p className="text-sm text-sol-dark/70 leading-relaxed">
                Once approved, you will sign an adoption contract and receive your new pet! You will also receive care guides and an official Shelter of Light adoption certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE RULES SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-sol-dark mb-4">Adoption Rules & Requirements</h2>
            <p className="text-sol-dark/60 max-w-2xl mx-auto">By adopting from Shelter of Light, you agree to treat the animal as a beloved family member and never neglect or abandon them.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Cats */}
            <div className="bg-[#f8f7f2] p-8 rounded-2xl border border-sol-dark/10">
              <div className="flex items-center gap-4 mb-6 border-b border-sol-dark/10 pb-4">
                <div className="w-12 h-12 bg-sol-dark text-sol-yellow rounded-full flex items-center justify-center">
                  <i className="ti ti-cat text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-sol-dark">For Cats</h3>
              </div>
              <ul className="space-y-4 text-sm text-sol-dark/80">
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Keep the cat indoors only.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Let them roam freely at home (absolutely no caging or leashing).</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Provide regular vaccines, quality food, vet care, and checkups.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Have the cat spayed/neutered around 6 months old.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Follow the cat's current routine and diet as much as possible.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Send periodic updates to the Shelter of Light team.</li>
              </ul>
            </div>

            {/* Dogs */}
            <div className="bg-[#f8f7f2] p-8 rounded-2xl border border-sol-dark/10">
              <div className="flex items-center gap-4 mb-6 border-b border-sol-dark/10 pb-4">
                <div className="w-12 h-12 bg-sol-dark text-sol-yellow rounded-full flex items-center justify-center">
                  <i className="ti ti-dog text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-sol-dark">For Dogs</h3>
              </div>
              <ul className="space-y-4 text-sm text-sol-dark/80">
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Allow the dog to live freely inside the house (rather than being permanently caged outside).</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Provide regular leash walks and daily exercise.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Provide regular vaccines, quality food, vet care, and checkups.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Have the dog spayed/neutered when age-appropriate.</li>
                <li className="flex gap-3"><i className="ti ti-check text-green-600 font-bold text-lg shrink-0"></i> Send periodic updates to the Shelter of Light team.</li>
              </ul>
            </div>

          </div>
          
          <div className="mt-12 text-center">
            <Link href="/adopt" className="inline-block bg-sol-yellow text-sol-dark px-10 py-4 rounded-full font-bold hover:bg-yellow-400 transition-colors shadow-sm">
              I Agree. View Available Animals &rarr;
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}