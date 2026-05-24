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
  
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    age: '',
    description: '',
    adoption_status: ''
  });

  useEffect(() => {
    async function fetchAnimal() {
      const { data, error } = await supabase
        .from('animals')
        .select(`*, animal_photos(file_url)`)
        .eq('animal_id', params.id)
        .single();

      if (data) {
        setFormData({
          name: data.name,
          species: data.species.charAt(0).toUpperCase() + data.species.slice(1),
          breed: data.breed || '',
          gender: data.sex.charAt(0).toUpperCase() + data.sex.slice(1),
          age: data.age_estimate || '',
          description: data.backstory || '',
          adoption_status: data.adoption_status
        });
        
        if (data.animal_photos && data.animal_photos.length > 0) {
          setCurrentPhotoUrl(data.animal_photos[0].file_url);
        }
      }
      setIsLoading(false);
    }
    fetchAnimal();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await supabase
        .from('animals')
        .update({
          name: formData.name,
          species: formData.species.toLowerCase(),
          sex: formData.gender.toLowerCase(),
          breed: formData.breed,
          age_estimate: formData.age,
          backstory: formData.description,
          adoption_status: formData.adoption_status
        })
        .eq('animal_id', params.id);

      if (newPhotoFile) {
        if (currentPhotoUrl) {
          const oldFileName = currentPhotoUrl.split('/').pop()?.split('?')[0];
          if (oldFileName) await supabase.storage.from('animal_photos').remove([oldFileName]);
        }

        const fileExt = newPhotoFile.name.split('.').pop();
        const fileName = `${params.id}-${Math.random()}.${fileExt}`;
        
        await supabase.storage.from('animal_photos').upload(fileName, newPhotoFile);
        const { data: publicUrlData } = supabase.storage.from('animal_photos').getPublicUrl(fileName);

        await supabase.from('animal_photos').delete().eq('animal_id', params.id);
        await supabase.from('animal_photos').insert([{
          animal_id: params.id,
          file_url: publicUrlData.publicUrl,
          is_primary: true
        }]);
      }

      alert('Profile updated!');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${formData.name}?`)) return;

    try {
      if (currentPhotoUrl) {
        const oldFileName = currentPhotoUrl.split('/').pop()?.split('?')[0];
        if (oldFileName) await supabase.storage.from('animal_photos').remove([oldFileName]);
      }

      await supabase.from('animals').delete().eq('animal_id', params.id);
      alert('Animal removed.');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error deleting animal.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-sol-dark/50">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-12 p-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/animals" className="text-sm text-sol-dark/60 hover:text-sol-yellow transition-colors">&larr; Back</Link>
        <button onClick={handleDelete} className="text-xs bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Delete</button>
      </div>

      <h1 className="font-serif text-3xl text-sol-dark font-bold mb-8">Edit {formData.name}</h1>

      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl border border-sol-dark/10 space-y-8">
        <div>
          <label className="block text-xs font-bold text-sol-dark/70 uppercase tracking-wider mb-4">Photo</label>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-xl border-2 border-sol-dark/10 overflow-hidden bg-[#f8f7f2]">
              {(photoPreview || currentPhotoUrl) ? (
                <img src={photoPreview || currentPhotoUrl!} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sol-dark/30">No Photo</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-sol-dark/10">
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Status</label>
            <select name="adoption_status" value={formData.adoption_status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 bg-white">
              <option value="available">Available</option>
              <option value="on_hold">On Hold</option>
              <option value="adopted">Adopted</option>
              <option value="sanctuary">Sanctuary</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Species</label>
            <select name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 bg-white">
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20 bg-white">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Age</label>
            <input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-sol-dark/70 uppercase mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-sol-dark/20"></textarea>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full bg-sol-dark text-sol-yellow py-3 rounded-lg font-bold hover:bg-black transition-colors">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}