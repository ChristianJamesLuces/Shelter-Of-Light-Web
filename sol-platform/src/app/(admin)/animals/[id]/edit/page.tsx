'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageAnimalPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    color: '', 
    gender: '',
    age: '',
    adoption_status: '',
    
    kapon_status: false,
    vaccine_status: false,
    deworming_status: false,
    flea_treatment_status: false,
    medical_history: '',

    temperament: '',
    good_with_cats: 'unknown',
    good_with_dogs: 'unknown',
    good_with_children: 'unknown', 

    special_needs: '',
    diet_restrictions: '',
    
    description: '',
  });

  // SAFETY FILTER: Forces values into matching database enum values ('yes', 'no', 'unknown')
  const sanitizeCompatibility = (val: any) => {
    if (val === true || val === 'true' || val === 'yes') return 'yes';
    if (val === false || val === 'false' || val === 'no') return 'no';
    return 'unknown';
  };

  const getFilePathFromUrl = (url: string) => {
    try {
      if (url.includes('/object/public/')) {
        const parts = url.split('/object/public/animal_photos/');
        if (parts.length > 1) {
          return decodeURIComponent(parts[1].split('?')[0]);
        }
      }
      const parts = url.split('/animal_photos/');
      if (parts.length > 1) {
        return decodeURIComponent(parts[1].split('?')[0]);
      }
      const fallback = url.split('/').pop()?.split('?')[0];
      return decodeURIComponent(fallback || '');
    } catch (error) {
      console.error("Failed to parse file path:", error);
      return null;
    }
  };

  useEffect(() => {
    async function fetchAnimal() {
      const { data, error } = await supabase
        .from('animals')
        .select(`*, animal_photos(file_url)`)
        .eq('animal_id', params.id)
        .single();

      if (data) {
        setFormData({
          name: data.name || '',
          species: data.species ? data.species.charAt(0).toUpperCase() + data.species.slice(1) : 'Cat',
          breed: data.breed || '',
          color: data.color || '', 
          gender: data.sex ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1) : 'Female',
          age: data.age_estimate || '',
          adoption_status: data.adoption_status || 'available',
          
          kapon_status: data.kapon_status || false,
          vaccine_status: data.vaccine_status || false,
          deworming_status: data.deworming_status || false,
          flea_treatment_status: data.flea_treatment_status || false,
          medical_history: data.medical_history || '',
          
          temperament: data.temperament || '',
          good_with_cats: sanitizeCompatibility(data.good_with_cats),
          good_with_dogs: sanitizeCompatibility(data.good_with_dogs),
          good_with_children: sanitizeCompatibility(data.good_with_children),
          
          special_needs: data.special_needs || '',
          diet_restrictions: data.diet_restrictions || '',
          
          description: data.backstory || ''
        });
        
        if (data.animal_photos) {
          setExistingPhotos(data.animal_photos);
          if (data.animal_photos.length > 0) {
            setCurrentPhotoUrl(data.animal_photos[0].file_url);
          }
        }
      }
      setIsLoading(false);
    }
    fetchAnimal();
  }, [params.id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (newPhotoFile) {
        if (existingPhotos.length > 0) {
          const fileNamesToRemove = existingPhotos
            .map(photo => getFilePathFromUrl(photo.file_url))
            .filter((path): path is string => path !== null && path !== '');

          if (fileNamesToRemove.length > 0) {
            const { error: removeError } = await supabase.storage
              .from('animal_photos')
              .remove(fileNamesToRemove);
            if (removeError) throw new Error(`Storage Deletion Failed: ${removeError.message}`);
          }
        }

        const fileExt = newPhotoFile.name.split('.').pop();
        const fileName = `${params.id}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('animal_photos')
          .upload(fileName, newPhotoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('animal_photos')
          .getPublicUrl(fileName);

        await supabase.from('animal_photos').delete().eq('animal_id', params.id);
        
        const { error: insertError } = await supabase.from('animal_photos').insert([{
          animal_id: params.id,
          file_url: publicUrlData.publicUrl,
          is_primary: true
        }]);

        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase
        .from('animals')
        .update({
          name: formData.name,
          species: formData.species.toLowerCase(),
          sex: formData.gender.toLowerCase(),
          breed: formData.breed,
          color: formData.color, 
          age_estimate: formData.age,
          adoption_status: formData.adoption_status,
          
          kapon_status: formData.kapon_status,
          vaccine_status: formData.vaccine_status,
          deworming_status: formData.deworming_status,
          flea_treatment_status: formData.flea_treatment_status,
          medical_history: formData.medical_history,
          
          temperament: formData.temperament,
          good_with_cats: sanitizeCompatibility(formData.good_with_cats),
          good_with_dogs: sanitizeCompatibility(formData.good_with_dogs),
          good_with_children: sanitizeCompatibility(formData.good_with_children),
          
          special_needs: formData.special_needs,
          diet_restrictions: formData.diet_restrictions,
          backstory: formData.description
        })
        .eq('animal_id', params.id);

      if (updateError) throw updateError;

      alert('Profile updated successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Full error details:", error);
      alert(`Error updating profile: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${formData.name}? This action cannot be undone.`)) return;

    try {
      if (existingPhotos.length > 0) {
        const fileNamesToRemove = existingPhotos
          .map(photo => getFilePathFromUrl(photo.file_url))
          .filter((path): path is string => path !== null && path !== '');

        if (fileNamesToRemove.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('animal_photos')
            .remove(fileNamesToRemove);
          if (storageError) throw new Error(`Storage Deletion Failed: ${storageError.message}`);
        }
      }

      const { error: dbError } = await supabase.from('animals').delete().eq('animal_id', params.id);
      if (dbError) throw dbError;

      alert('Animal and all associated photos removed.');
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      alert(`Error deleting animal: ${error.message || error}`);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sol-dark/50">Loading profile data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <Link href="/animals" className="text-sm text-sol-dark/60 hover:text-sol-yellow transition-colors">&larr; Back to Inventory</Link>
        <button onClick={handleDelete} className="text-xs bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm">Delete Animal</button>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-sol-dark font-bold mb-1">Edit {formData.name}'s Profile</h1>
        <p className="text-sm text-sol-dark/60">Update medical history, status, and behavioral notes.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        
        {/* --- SECTION 1: PHOTO --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-4">Primary Photo</label>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl border-2 border-sol-dark/10 overflow-hidden bg-[#f8f7f2] flex items-center justify-center shrink-0">
              {(photoPreview || currentPhotoUrl) ? (
                <img src={photoPreview || currentPhotoUrl!} alt="Preview" className="w-full h-full object-cover" />
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
              <p className="text-xs text-sol-dark/40 mt-2">Upload a new photo to replace the current one.</p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: BASIC INFO & STATUS --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2 flex justify-between items-end">
            <span>1. Basic Information</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2 text-sol-yellow">Adoption Status</label>
              <select name="adoption_status" value={formData.adoption_status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-yellow bg-sol-yellow/5 focus:outline-none focus:ring-1 focus:ring-sol-yellow font-bold text-sol-dark transition-colors cursor-pointer">
                <option value="available">Available for Adoption</option>
                <option value="on_hold">On Hold</option>
                <option value="adopted">Adopted</option>
                <option value="sanctuary">Sanctuary Resident</option>
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
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Species *</label>
              <select required name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Age (Estimate)</label>
              <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Breed</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Color / Markings</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
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
            <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors resize-none"></textarea>
          </div>
        </div>

        {/* --- SECTION 4: BEHAVIOR & COMPATIBILITY --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2 flex items-center gap-2"><i className="ti ti-mood-smile"></i> 3. Behavior & Compatibility</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Temperament Profile</label>
              <input type="text" name="temperament" value={formData.temperament} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
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
            
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Good with Children?</label>
              <select name="good_with_children" value={formData.good_with_children as string} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- SECTION 5: SPECIAL CARE & STORY --- */}
        <div className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm">
          <h2 className="text-lg font-bold text-sol-dark mb-6 border-b border-sol-dark/10 pb-2">4. Special Care & Backstory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Special Needs / Care Required</label>
              <input type="text" name="special_needs" value={formData.special_needs} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Dietary Restrictions</label>
              <input type="text" name="diet_restrictions" value={formData.diet_restrictions} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Rescue Story / Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors resize-none"></textarea>
          </div>
        </div>

        <div className="sticky bottom-4 z-10">
          <button type="submit" disabled={isSaving} className="w-full bg-sol-dark text-sol-yellow py-4 rounded-xl font-bold text-lg hover:bg-black shadow-xl transition-colors disabled:opacity-50 border border-sol-dark/10">
            {isSaving ? 'Saving Changes...' : 'Save Updated Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}