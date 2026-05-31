'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdoptionForm({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    reqAge: false,
    reqJob: false,
    reqLocation: false,
    reqNotGifting: false,
    dataPrivacyConsent: false,
    fullName: '',
    email: '',
    phone: '', 
    fbLink: '', 
    age: '',
    occupation: '',
    employmentStatus: 'Regular',
    address: '',
    city: '', // This will now be controlled by the dropdown
    environmentNotes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Type assertion to handle the checked property safely for checkboxes
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Clean, exact check based on the new dropdown values
      const ncrCities = [
        'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 
        'Manila', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 
        'Pasay', 'Pasig', 'Pateros', 'Quezon City', 'San Juan', 
        'Taguig', 'Valenzuela'
      ];
      const isMetroManila = ncrCities.includes(formData.city);

      const { data: adopterData, error: adopterError } = await supabase
        .from('adopters')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null, 
          fb_link: formData.fbLink, 
          age: parseInt(formData.age),
          occupation: formData.occupation,
          employment_status: formData.employmentStatus,
          address: formData.address,
          city: formData.city, // Saves the exact dropdown selection
          is_metro_manila: isMetroManila,
          is_for_gifting: !formData.reqNotGifting
        })
        .select()
        .single();

      if (adopterError) throw adopterError;

      const { error: appError } = await supabase
        .from('applications')
        .insert({
          adopter_id: adopterData.adopter_id,
          animal_id: parseInt(params.id), 
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
          <p className="text-lg mb-8">Thank you for opening your heart to a shelter pet. Our team will review your application and reach out via Facebook Messenger for the interview step.</p>
          <Link href="/adopt" className="bg-sol-dark text-sol-yellow px-6 py-3 rounded-md font-bold hover:bg-black transition-colors">
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

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div className="bg-sol-yellow h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
          
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
                <span>I am based in Quezon City or nearby areas.</span>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" name="reqNotGifting" checked={formData.reqNotGifting} onChange={handleChange} required className="mt-1" />
                <span>I am adopting this pet for myself, not as a gift.</span>
              </label>

              <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <i className="ti ti-shield-check"></i> Data Privacy Act of 2012 (RA 10173)
                </h3>
                <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                   In compliance with the Philippine Data Privacy Act, Shelter of Light securely processes your personal information solely for adoption vetting and interview scheduling. Your information is strictly confidential and will never be shared with third parties.
                </p>
                <label className="flex items-start space-x-3 p-3 border border-blue-200 bg-white rounded cursor-pointer hover:bg-blue-50/50 transition-colors">
                  <input type="checkbox" name="dataPrivacyConsent" checked={formData.dataPrivacyConsent} onChange={handleChange} required className="mt-1" />
                  <span className="text-sm font-medium text-sol-dark">I have read and consent to the collection and secure processing of my personal data.</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Your Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" min="21" value={formData.age} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-sol-dark mb-1">FB / Messenger Link <span className="text-red-500 font-normal text-xs">* Required for Interviews</span></label>
                  <input type="url" name="fbLink" placeholder="https://facebook.com/yourprofile" value={formData.fbLink} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none bg-yellow-50/30" />
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input type="text" name="address" placeholder="House/Unit No., Street, Barangay" value={formData.address} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City / Province</label>
                  <select 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-sol-yellow outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select your city...</option>
                    
                    <optgroup label="Metro Manila">
                      <option value="Caloocan">Caloocan</option>
                      <option value="Las Piñas">Las Piñas</option>
                      <option value="Makati">Makati</option>
                      <option value="Malabon">Malabon</option>
                      <option value="Mandaluyong">Mandaluyong</option>
                      <option value="Manila">Manila</option>
                      <option value="Marikina">Marikina</option>
                      <option value="Muntinlupa">Muntinlupa</option>
                      <option value="Navotas">Navotas</option>
                      <option value="Parañaque">Parañaque</option>
                      <option value="Pasay">Pasay</option>
                      <option value="Pasig">Pasig</option>
                      <option value="Pateros">Pateros</option>
                      <option value="Quezon City">Quezon City</option>
                      <option value="San Juan">San Juan</option>
                      <option value="Taguig">Taguig</option>
                      <option value="Valenzuela">Valenzuela</option>
                    </optgroup>
                    
                    <optgroup label="Nearby Provinces">
                      <option value="Bulacan">Bulacan</option>
                      <option value="Cavite">Cavite</option>
                      <option value="Laguna">Laguna</option>
                      <option value="Rizal">Rizal</option>
                    </optgroup>
                    
                    <optgroup label="Other">
                      <option value="Other">Other (Please specify in Street Address)</option>
                    </optgroup>
                  </select>
                </div>
                
              </div>
            </div>
          )}

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
                  placeholder="e.g., We live in an apartment. The pet will be strictly indoors..."
                ></textarea>
              </div>
            </div>
          )}

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