'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
// THE FIX: Import the new email function
import { sendStaffApprovalEmail } from '@/app/actions/email'; 

export default function StaffManagementPage() {
  const supabase = createClient();
  
  // Data State
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setStaff(data);
    setIsLoading(false);
  };

  // THE FIX: Passed in email and name so we can send the email!
  const toggleApproval = async (userId: number, currentStatus: boolean, userEmail: string, userName: string) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('users').update({ is_active: newStatus }).eq('user_id', userId);
    
    if (!error) {
      setStaff(staff.map(user => user.user_id === userId ? { ...user, is_active: newStatus } : user));
      
      // If we just APPROVED them (newStatus is true), send the email!
      if (newStatus === true && userEmail) {
        try {
          await sendStaffApprovalEmail(userEmail, userName);
        } catch (err) {
          console.warn("Could not send approval email", err);
        }
      }
      
    } else {
      alert('Error updating user status.');
    }
  };

  const saveName = async (userId: number) => {
    const { error } = await supabase.from('users').update({ full_name: editName }).eq('user_id', userId);
    if (!error) {
      setStaff(staff.map(user => user.user_id === userId ? { ...user, full_name: editName } : user));
      setEditingId(null);
    } else {
      alert('Error updating name. Ensure you ran the Admin RLS SQL script!');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to permanently delete this account? This cannot be undone.")) return;
    
    const { error } = await supabase.from('users').delete().eq('user_id', userId);
    if (!error) {
      setStaff(staff.filter(user => user.user_id !== userId));
    } else {
      alert('Error deleting user. Ensure you ran the Admin RLS SQL script!');
    }
  };

  const filteredStaff = staff.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchLower)) ||
      (user.username?.toLowerCase().includes(searchLower)) ||
      (user.email?.toLowerCase().includes(searchLower));

    let matchesFilter = true;
    if (statusFilter === 'active') matchesFilter = user.is_active === true;
    if (statusFilter === 'pending') matchesFilter = user.is_active === false;
    if (statusFilter === 'admin') matchesFilter = user.role_id === 1;
    if (statusFilter === 'staff') matchesFilter = user.role_id !== 1;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sol-dark mb-2">Staff Management</h1>
          <p className="text-sol-dark/60 text-sm">Approve accounts, manage roles, and edit profiles.</p>
        </div>
        <button onClick={fetchStaff} className="text-sm font-bold bg-white border border-sol-dark/10 text-sol-dark hover:bg-sol-cream px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <i className="ti ti-refresh text-lg"></i> Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-sol-dark/10 mb-6 flex flex-col sm:flex-row gap-3">
        
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-lg"></i>
          <input 
            type="text" 
            placeholder="Search by name, username, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#f8f7f2] border-transparent focus:bg-white focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none"
          />
        </div>

        <div className="relative min-w-[200px]">
          <i className="ti ti-filter absolute left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-lg pointer-events-none"></i>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#f8f7f2] border-transparent focus:bg-white focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-sm outline-none appearance-none cursor-pointer font-medium text-sol-dark"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Approval</option>
            <option value="admin">Admins Only</option>
            <option value="staff">Staff Only</option>
          </select>
          <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-sol-dark/40 pointer-events-none"></i>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-sol-dark/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sol-dark/50">
            <i className="ti ti-loader animate-spin text-3xl mb-3 block text-sol-yellow"></i>
            Loading staff directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/10 text-xs uppercase tracking-wider text-sol-dark/50 font-bold">
                  <th className="px-6 py-4">Name & Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {filteredStaff.map((user) => (
                  <tr key={user.user_id} className="hover:bg-sol-cream/20 transition-colors">
                    
                    {/* Name & Role Column */}
                    <td className="px-6 py-4">
                      {editingId === user.user_id ? (
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-sol-dark/20 rounded px-2 py-1 text-sm font-bold text-sol-dark focus:outline-none focus:border-sol-yellow"
                            autoFocus
                          />
                          <button onClick={() => saveName(user.user_id)} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded">
                            <i className="ti ti-check font-bold"></i>
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600 bg-red-50 p-1 rounded">
                            <i className="ti ti-x font-bold"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="font-bold text-sol-dark flex items-center gap-2 mb-1 group">
                          {user.full_name}
                          
                          {/* THE ROLE BADGE */}
                          {user.role_id === 1 ? (
                             <span className="bg-sol-dark text-sol-yellow text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wide">Admin</span>
                          ) : (
                             <span className="bg-sol-dark/10 text-sol-dark/60 text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wide">Staff</span>
                          )}

                          <button 
                            onClick={() => { setEditingId(user.user_id); setEditName(user.full_name); }}
                            className="text-sol-dark/30 hover:text-sol-yellow opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit Name"
                          >
                            <i className="ti ti-edit"></i>
                          </button>
                        </div>
                      )}
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Pending
                        </span>
                      )}
                    </td>
                    
                    {/* Action Buttons Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.is_active ? (
                          <button 
                            onClick={() => toggleApproval(user.user_id, user.is_active, user.email, user.full_name || user.username)}
                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button 
                            onClick={() => toggleApproval(user.user_id, user.is_active, user.email, user.full_name || user.username)}
                            className="text-xs font-bold text-sol-dark bg-sol-yellow hover:bg-yellow-400 px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteUser(user.user_id)}
                          className="text-sol-dark/30 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors ml-1"
                          title="Permanently Delete User"
                        >
                          <i className="ti ti-trash text-lg"></i>
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
                
                {/* Empty States */}
                {!isLoading && staff.length > 0 && filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <i className="ti ti-search text-4xl text-sol-dark/20 mb-3 block"></i>
                      <p className="text-sol-dark/50 font-medium">No accounts match your search.</p>
                      <button onClick={() => {setSearchQuery(''); setStatusFilter('all');}} className="text-sol-yellow font-bold text-sm mt-2 hover:underline">Clear Filters</button>
                    </td>
                  </tr>
                )}

                {!isLoading && staff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-sol-dark/50 font-medium">
                      <i className="ti ti-users text-4xl text-sol-dark/20 mb-3 block"></i>
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