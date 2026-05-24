'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionForm({ params }: { params: { animalId: string } }) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Requirements
    reqAge: false,
    reqJob: false,
    reqLocation: false,
    reqNotGifting: false,
    
    // Step 2: Adopter Info
    fullName: '',
    email: '',
    phone: '',
    age: '',
    occupation: '',
    employmentStatus: 'Regular',
    address: '',
    city: '',
    
    // Step 3: Environment
    environmentNotes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Determine if Metro Manila based on city input (simple check for demo)
      const isMetroManila = ['manila', 'quezon city', 'makati', 'taguig', 'pasig', 'pasay', 'mandaluyong', 'marikina', 'caloocan', 'valenzuela', 'malabon', 'navotas', 'muntinlupa', 'las piñas', 'parañaque', 'san juan', 'pateros'].some(c => formData.city.toLowerCase().includes(c));

      // 2. Insert into adopters table
      const { data: adopterData, error: adopterError } = await supabase
        .from('adopters')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          occupation: formData.occupation,
          employment_status: formData.employmentStatus,
          address: formData.address,
          city: formData.city,
          is_metro_manila: isMetroManila,
          is_for_gifting: !formData.reqNotGifting
        })
        .select()
        .single();

      if (adopterError) throw adopterError;

      // 3. Insert into applications table using the new adopter_id
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          adopter_id: adopterData.adopter_id,
          animal_id: parseInt(params.animalId),
          status: 'submitted',
          home_environment_notes: formData.environmentNotes,
          meets_general_reqs: formData.reqAge && formData.reqJob && formData.reqLocation && formData.reqNotGifting,
          meets_pet_reqs: true 
        });

      if (appError) throw appError;

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className="bg-green-100 text-green-800 p-8 rounded-xl border border-green-200">
          <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
          <p className="text-lg mb-8">Thank you for opening your heart to a shelter pet. Our team will review your application and reach out via email for the interview step.</p>
          <Link href="/animals" className="bg-sol-dark text-sol-yellow px-6 py-3 rounded-md font-bold hover:bg-black transition-colors">
            Back to Animals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-sol-dark mb-2">Adoption Application</h1>
        <p className="text-gray-600 mb-8">Step {step} of 3</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div className="bg-sol-yellow h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
          
          {/* STEP 1: REQUIREMENTS */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">General Requirements</h2>
              <label className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="reqAge" checked={formData.reqAge} onChange={handleChange} required className="mt-1" />
                <span>I am at least 21 years old.</span>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="reqJob" checked={formData.reqJob} onChange={handleChange} required className="mt-1" />
                <span>I have a regular and stable job.</span>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="reqLocation" checked={formData.reqLocation} onChange={handleChange} required className="mt-1" />
                <span>I am based in Metro Manila or nearby areas.</span>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="reqNotGifting" checked={formData.reqNotGifting} onChange={handleChange} required className="mt-1" />
                <span>I am adopting this pet for myself, not as a gift.</span>
              </label>
            </div>
          )}

          {/* STEP 2: PERSONAL INFO */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Your Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" min="21" value={formData.age} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ENVIRONMENT */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Home Environment</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Please describe your home setup. Will the pet be strictly indoors? Do you have a secure gate?</label>
                <textarea 
                  name="environmentNotes" 
                  value={formData.environmentNotes} 
                  onChange={handleChange} 
                  required 
                  rows={5}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-sol-yellow outline-none"
                  placeholder="e.g., We live in an apartment. The cat will be strictly indoors..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between pt-6 border-t">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50">Back</button>
            ) : <div></div>}
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-sol-dark text-sol-yellow font-bold rounded hover:bg-black disabled:opacity-50"
            >
              {step === 3 ? (isSubmitting ? 'Submitting...' : 'Submit Application') : 'Next Step'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}