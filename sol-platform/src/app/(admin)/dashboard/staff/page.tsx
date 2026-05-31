'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StaffManagementPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all users when the page loads
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    // Fetch users and sort them so the newest sign-ups are at the top
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      setStaff(data);
    } else if (error) {
      console.error('Error fetching staff:', error);
    }
    setIsLoading(false);
  };

  // The function that runs when the Admin clicks Approve/Revoke
  const toggleApproval = async (userId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus; // Flip it (if false, make true. If true, make false)

    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('user_id', userId);

    if (!error) {
      // Instantly update the UI without needing to refresh the page!
      setStaff(staff.map(user => 
        user.user_id === userId ? { ...user, is_active: newStatus } : user
      ));
    } else {
      alert('Error updating user status. Check database permissions.');
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Staff Management</h1>
          <p className="text-sol-dark/60">Approve new staff accounts and manage system access.</p>
        </div>
        <button onClick={fetchStaff} className="text-sm font-medium text-sol-dark/50 hover:text-sol-yellow transition-colors flex items-center gap-2">
          <i className="ti ti-refresh text-lg"></i> Refresh List
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sol-dark/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sol-dark/50">
            <i className="ti ti-loader animate-spin text-3xl mb-3 block"></i>
            Loading staff directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/10 text-xs uppercase tracking-wider text-sol-dark/50 font-bold">
                  <th className="px-6 py-4">Name & Username</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {staff.map((user) => (
                  <tr key={user.user_id} className="hover:bg-sol-cream/20 transition-colors">
                    
                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-sol-dark">{user.full_name}</div>
                      <div className="text-xs text-sol-dark/50">@{user.username}</div>
                    </td>
                    
                    {/* Contact Column */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-sol-dark/80 flex items-center gap-2">
                        <i className="ti ti-mail text-sol-dark/40"></i> {user.email}
                      </div>
                    </td>
                    
                    {/* Status Badge Column */}
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Pending
                        </span>
                      )}
                    </td>
                    
                    {/* Action Buttons Column */}
                    <td className="px-6 py-4 text-right">
                      {user.is_active ? (
                        <button 
                          onClick={() => toggleApproval(user.user_id, user.is_active)}
                          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleApproval(user.user_id, user.is_active)}
                          className="text-xs font-bold text-sol-dark bg-sol-yellow hover:bg-yellow-400 px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          Approve Staff
                        </button>
                      )}
                    </td>
                    
                  </tr>
                ))}
                
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sol-dark/50">
                      No staff accounts found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}