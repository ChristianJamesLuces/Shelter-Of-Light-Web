'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddAnimalPage() {
  const supabase = createClient();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for the Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Expanded Form Data State mapped exactly to your Database
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    species: 'Cat',
    breed: '',
    color: '',
    gender: 'Female',
    age: '',
    
    // Health & Medical (Booleans & Text)
    kapon_status: false,
    vaccine_status: false,
    deworming_status: false,
    flea_treatment_status: false,
    medical_history: '',

    // Personality & Compatibility
    temperament: '',
    good_with_cats: 'unknown',
    good_with_dogs: 'unknown',
    good_with_children: false, // This one is a boolean in your DB!

    // Special Care
    special_needs: '',
    diet_restrictions: '',
    
    // Backstory
    description: '',
  });

  // Updated handler to support both text inputs and checkboxes (booleans)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // If the input is a checkbox, use the 'checked' value (true/false) instead of the text value
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Insert ALL comprehensive data into the animals table
      const { data: newAnimal, error: insertError } = await supabase
      .from('animals')
      .insert([{
          // Basic Info
          name: formData.name,
          species: formData.species.toLowerCase(), 
          sex: formData.gender.toLowerCase(),      
          breed: formData.breed,
          color: formData.color,
          age_estimate: formData.age,              
          
          // Health Data
          kapon_status: formData.kapon_status,
          vaccine_status: formData.vaccine_status,
          deworming_status: formData.deworming_status,
          flea_treatment_status: formData.flea_treatment_status,
          medical_history: formData.medical_history,

          // Behavior & Compatibility
          temperament: formData.temperament,
          good_with_cats: formData.good_with_cats,
          good_with_dogs: formData.good_with_dogs,
          good_with_children: formData.good_with_children,

          // Special Care & Story
          special_needs: formData.special_needs,
          diet_restrictions: formData.diet_restrictions,
          backstory: formData.description,         
          
          // System Defaults
          adoption_status: 'available',            
          encoded_by: 1,                           
          date_taken_in: new Date().toISOString().split('T')[0] 
      }])
      .select()
      .single();

      if (insertError) throw insertError;

      // 2. Upload photo if provided
      if (photoFile && newAnimal) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${newAnimal.animal_id}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('animal_photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('animal_photos')
          .getPublicUrl(fileName);

        const { error: photoDbError } = await supabase
          .from('animal_photos')
          .insert([{
            animal_id: newAnimal.animal_id,
            file_url: publicUrlData.publicUrl,
            is_primary: true
          }]);

        if (photoDbError) throw photoDbError;
      }

      alert(`${formData.name} has been successfully added to the system!`);
      router.push('/dashboard'); // Or router.push('/animals') if you prefer
      
    } catch (err: any) {
      console.error('Error adding animal:', err);
      setError(err.message || 'Failed to add animal. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/dashboard" className="text-sm text-sol-dark/60 hover:text-sol-yellow mb-6 inline-block transition-colors">
        &larr; Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-sol-dark font-bold">Add New Intake</h1>
        <p className="text-sm text-sol-dark/60 mt-1">Create a comprehensive shelter record for a new arrival.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- SECTION 1: PHOTO --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-4">Primary Photo</label>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-sol-dark/20 bg-[#f8f7f2] flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <i className="ti ti-photo text-3xl text-sol-dark/20"></i>
              )}
            </div>
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-sol-dark/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-sol-dark file:text-sol-yellow hover:file:bg-black transition-colors cursor-pointer"
              />
              <p className="text-xs text-sol-dark/40 mt-2">Upload a clear, well-lit photo of the animal (JPG or PNG).</p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: BASIC INFO --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Species *</label>
              <select required name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Gender *</label>
              <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Age (Estimate)</label>
              <input type="text" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 2 Months, 3 Years" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Breed</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} placeholder="e.g. Puspin, Aspin" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Color / Markings</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Orange Tabby, Tuxedo" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
          </div>
        </div>

        {/* --- SECTION 3: HEALTH & MEDICAL --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2 flex items-center gap-2"><i className="ti ti-heartbeat"></i> 2. Health & Vetting</h2>
          
          <div className="flex flex-wrap gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer bg-sol-cream/30 px-4 py-2 rounded-lg border border-sol-dark/5 hover:bg-sol-cream transition-colors">
              <input type="checkbox" name="kapon_status" checked={formData.kapon_status} onChange={handleChange} className="w-4 h-4 accent-sol-dark" />
              <span className="text-sm font-medium text-sol-dark">Spayed / Neutered</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-sol-cream/30 px-4 py-2 rounded-lg border border-sol-dark/5 hover:bg-sol-cream transition-colors">
              <input type="checkbox" name="vaccine_status" checked={formData.vaccine_status} onChange={handleChange} className="w-4 h-4 accent-sol-dark" />
              <span className="text-sm font-medium text-sol-dark">Vaccinated</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-sol-cream/30 px-4 py-2 rounded-lg border border-sol-dark/5 hover:bg-sol-cream transition-colors">
              <input type="checkbox" name="deworming_status" checked={formData.deworming_status} onChange={handleChange} className="w-4 h-4 accent-sol-dark" />
              <span className="text-sm font-medium text-sol-dark">Dewormed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-sol-cream/30 px-4 py-2 rounded-lg border border-sol-dark/5 hover:bg-sol-cream transition-colors">
              <input type="checkbox" name="flea_treatment_status" checked={formData.flea_treatment_status} onChange={handleChange} className="w-4 h-4 accent-sol-dark" />
              <span className="text-sm font-medium text-sol-dark">Flea Treated</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Medical History / Notes</label>
            <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} placeholder="Record past illnesses, surgeries, or ongoing conditions..." className="w-full px-4 py-3 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors resize-none"></textarea>
          </div>
        </div>

        {/* --- SECTION 4: BEHAVIOR & COMPATIBILITY --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2 flex items-center gap-2"><i className="ti ti-mood-smile"></i> 3. Behavior & Compatibility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Temperament Profile</label>
              <input type="text" name="temperament" value={formData.temperament} onChange={handleChange} placeholder="e.g. Playful, Shy but sweet, Energetic, Couch potato" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Good with Cats?</label>
              <select name="good_with_cats" value={formData.good_with_cats} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Good with Dogs?</label>
              <select name="good_with_dogs" value={formData.good_with_dogs} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="good_with_children" checked={formData.good_with_children} onChange={handleChange} className="w-4 h-4 accent-sol-dark" />
                <span className="text-sm font-medium text-sol-dark">Good with Children</span>
              </label>
            </div>
          </div>
        </div>

        {/* --- SECTION 5: SPECIAL CARE & STORY --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2">4. Special Care & Backstory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Special Needs / Care Required</label>
              <input type="text" name="special_needs" value={formData.special_needs} onChange={handleChange} placeholder="e.g. Needs daily ear drops, Blind in one eye" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Dietary Restrictions</label>
              <input type="text" name="diet_restrictions" value={formData.diet_restrictions} onChange={handleChange} placeholder="e.g. Urinary S/O Diet only, No chicken" className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Rescue Story / Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Share the story of how they arrived at the shelter and their unique personality..." className="w-full px-4 py-3 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors resize-none"></textarea>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-4 z-10">
          <button type="submit" disabled={isSubmitting} className="w-full bg-sol-yellow text-sol-dark py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 shadow-xl transition-colors disabled:opacity-50 border border-sol-dark/10">
            {isSubmitting ? 'Saving intake record...' : 'Save New Animal Record'}
          </button>
        </div>
      </form>
    </div>
  );
}