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
  
  // New State for the Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'Cat',
    breed: '',
    gender: 'Female',
    age: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection and create a preview
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); // Creates a temporary local URL for the preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Insert the animal data first
      // 1. Insert the animal data first
    const { data: newAnimal, error: insertError } = await supabase
    .from('animals')
    .insert([{
        name: formData.name,
        species: formData.species.toLowerCase(), // ENUM expects lowercase 'cat' or 'dog'
        sex: formData.gender.toLowerCase(),      // Maps form 'gender' to DB 'sex', lowercase for ENUM
        breed: formData.breed,
        age_estimate: formData.age,              // Matches your text column
        backstory: formData.description,         // Maps form 'description' to DB 'backstory'
        adoption_status: 'available',            // Lowercase for ENUM
        encoded_by: 1,                           // Required NOT NULL (Temporarily hardcoded to Admin User ID 1)
        date_taken_in: new Date().toISOString().split('T')[0] // Required NOT NULL (Sets to today's date)
    }])
    .select()
    .single();

      if (insertError) throw insertError;

      // 2. If a photo was selected, upload it to Storage
      if (photoFile && newAnimal) {
        const fileExt = photoFile.name.split('.').pop();
        // Create a unique file name using the animal's ID
        const fileName = `${newAnimal.animal_id}-${Math.random()}.${fileExt}`;
        
        // Upload to a Supabase Storage bucket named 'animal_photos'
        const { error: uploadError } = await supabase.storage
          .from('animal_photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('animal_photos')
          .getPublicUrl(fileName);

        // 3. Link the photo URL to the animal in the animal_photos table
        const { error: photoDbError } = await supabase
          .from('animal_photos')
          .insert([{
            animal_id: newAnimal.animal_id,
            file_url: publicUrlData.publicUrl,
            is_primary: true
          }]);

        if (photoDbError) throw photoDbError;
      }

      alert(`${formData.name} has been successfully added with their photo!`);
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Error adding animal:', err);
      setError(err.message || 'Failed to add animal. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 p-8">
      <Link href="/dashboard" className="text-sm text-sol-dark/60 hover:text-sol-yellow mb-6 inline-block transition-colors">
        &larr; Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-sol-dark font-bold">Add New Animal</h1>
        <p className="text-sm text-sol-dark/60 mt-1">Create a new intake profile and upload their primary photo.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-sol-dark/10 shadow-sm space-y-8">
        
        {/* Photo Upload Section */}
        <div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-sol-dark/10">
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Species *</label>
            <select required name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Breed</label>
            <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Gender *</label>
            <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors bg-white">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Age / Estimated Age</label>
            <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-2">Description / Personality</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 focus:outline-none focus:border-sol-yellow transition-colors resize-none"></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-sol-dark/10">
          <button type="submit" disabled={isSubmitting} className="w-full bg-sol-dark text-sol-yellow py-3 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving to database...' : 'Add Animal & Photo'}
          </button>
        </div>
      </form>
    </div>
  );
}