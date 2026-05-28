import { createClient } from '@/lib/supabase/server';

export async function getAvailableAnimals() {
  const supabase = createClient();
  
  // THE FIX: We now query the base 'animals' table directly so we can pull the linked photos!
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      animal_photos ( file_url, is_primary )
    `)
    .eq('adoption_status', 'available')
    .order('created_at', { ascending: false }); // Optional: puts the newest rescues first!

  if (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
  
  return data;
}

export async function getAnimalById(id: string) {
  const supabase = createClient();
  
  // Fetch the animal and its related photos using Supabase's relational querying
  const { data, error } = await supabase
    .from('animals')
    .select(`
      *,
      animal_photos ( file_url, is_primary )
    `)
    .eq('animal_id', id)
    .single();

  if (error) {
    console.error('Error fetching animal detail:', error);
    return null;
  }
  
  return data;
}