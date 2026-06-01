'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
// Import the new email function
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
    <div className="p-2 sm:p-4 md:p-8 max-w-6xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="mb-4 sm:mb-6 flex justify-between items-start sm:items-end gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-sol-dark mb-1 sm:mb-2">Staff Management</h1>
          <p className="hidden sm:block text-sol-dark/60 text-sm">Approve accounts, manage roles, and edit profiles.</p>
        </div>
        <button onClick={fetchStaff} className="text-[10px] sm:text-sm font-bold bg-white border border-sol-dark/10 text-sol-dark hover:bg-sol-cream px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 sm:gap-2 shadow-sm shrink-0">
          <i className="ti ti-refresh text-sm sm:text-lg"></i> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm border border-sol-dark/10 mb-4 sm:mb-6 flex flex-row gap-2 w-full">
        
        <div className="relative flex-1 min-w-0">
          <i className="ti ti-search absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-xs sm:text-lg"></i>
          <input 
            type="text" 
            placeholder="Search name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 sm:pl-11 pr-2 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-[#f8f7f2] border-transparent focus:bg-white focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none"
          />
        </div>

        <div className="relative w-1/2 sm:w-1/3 min-w-0">
          <i className="ti ti-filter absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-sol-dark/40 text-xs sm:text-lg pointer-events-none"></i>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-7 sm:pl-11 pr-6 sm:pr-10 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-[#f8f7f2] border-transparent focus:bg-white focus:border-sol-yellow focus:ring-1 focus:ring-sol-yellow transition-all text-[10px] sm:text-sm outline-none appearance-none cursor-pointer font-medium text-sol-dark"
          >
            <option value="all">All Roles</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="admin">Admins</option>
            <option value="staff">Staff</option>
          </select>
          <i className="ti ti-chevron-down absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-sol-dark/40 pointer-events-none text-xs sm:text-base"></i>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-sol-dark/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sol-dark/50">
            <i className="ti ti-loader animate-spin text-3xl mb-3 block text-sol-yellow"></i>
            Loading staff directory...
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f7f2] border-b border-sol-dark/10 text-[9px] sm:text-xs uppercase tracking-wider text-sol-dark/50 font-bold">
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Name & Role</th>
                  {/* Dedicated Contact column hidden on phones */}
                  <th className="hidden md:table-cell px-6 py-4">Contact</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sol-dark/5">
                {filteredStaff.map((user) => (
                  <tr key={user.user_id} className="hover:bg-sol-cream/20 transition-colors">
                    
                    {/* Name & Role Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-top sm:align-middle min-w-0">
                      {editingId === user.user_id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-sol-dark/20 rounded px-2 py-1 text-[10px] sm:text-sm font-bold text-sol-dark focus:outline-none focus:border-sol-yellow w-full max-w-[150px]"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button onClick={() => saveName(user.user_id)} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded">
                              <i className="ti ti-check font-bold text-xs sm:text-base"></i>
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600 bg-red-50 p-1 rounded">
                              <i className="ti ti-x font-bold text-xs sm:text-base"></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="font-bold text-sol-dark flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 group break-words text-[11px] sm:text-sm">
                          <span className="line-clamp-2">{user.full_name}</span>
                          
                          <div className="flex items-center gap-1">
                            {user.role_id === 1 ? (
                               <span className="bg-sol-dark text-sol-yellow text-[7px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 rounded-full tracking-wide shrink-0">Admin</span>
                            ) : (
                               <span className="bg-sol-dark/10 text-sol-dark/60 text-[7px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 rounded-full tracking-wide shrink-0">Staff</span>
                            )}

                            <button 
                              onClick={() => { setEditingId(user.user_id); setEditName(user.full_name); }}
                              className="text-sol-dark/30 hover:text-sol-yellow lg:opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                              title="Edit Name"
                            >
                              <i className="ti ti-edit text-xs sm:text-base"></i>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-[9px] sm:text-xs text-sol-dark/50 truncate max-w-[120px] sm:max-w-none">@{user.username}</div>
                      
                      {/* FIX: Email visibly embedded here ONLY for mobile screens */}
                      <div className="md:hidden text-[9px] text-sol-dark/60 flex items-center gap-1 mt-0.5 truncate max-w-[140px]">
                        <i className="ti ti-mail shrink-0"></i> <span className="truncate">{user.email}</span>
                      </div>
                      
                    </td>
                    
                    {/* Dedicated Contact Column - Visible only on tablet/desktop */}
                    <td className="hidden md:table-cell px-6 py-4 align-middle min-w-0">
                      <div className="text-sm text-sol-dark/80 flex items-center gap-2 truncate">
                        <i className="ti ti-mail text-sol-dark/40 shrink-0"></i> <span className="truncate">{user.email}</span>
                      </div>
                    </td>
                    
                    {/* Status Badge Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-top sm:align-middle">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 hidden sm:inline-block"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse hidden sm:inline-block"></span> Pending
                        </span>
                      )}
                    </td>
                    
                    {/* Action Buttons Column */}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right align-top sm:align-middle">
                      <div className="flex flex-col xl:flex-row items-end sm:items-center justify-end gap-1.5 sm:gap-2">
                        {user.is_active ? (
                          <button 
                            onClick={() => toggleApproval(user.user_id, user.is_active, user.email, user.full_name || user.username)}
                            className="text-[9px] sm:text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg transition-colors border border-red-100 whitespace-nowrap"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button 
                            onClick={() => toggleApproval(user.user_id, user.is_active, user.email, user.full_name || user.username)}
                            className="text-[9px] sm:text-xs font-bold text-sol-dark bg-sol-yellow hover:bg-yellow-400 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg transition-colors shadow-sm whitespace-nowrap"
                          >
                            Approve
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteUser(user.user_id)}
                          className="text-sol-dark/30 hover:text-red-600 hover:bg-red-50 p-1 sm:p-2 rounded-md sm:rounded-lg transition-colors xl:ml-1"
                          title="Permanently Delete User"
                        >
                          <i className="ti ti-trash text-sm sm:text-lg"></i>
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
                
                {/* Empty States */}
                {!isLoading && staff.length > 0 && filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                      <i className="ti ti-search text-3xl sm:text-4xl text-sol-dark/20 mb-2 sm:mb-3 block"></i>
                      <p className="text-sol-dark/50 text-xs sm:text-sm font-medium">No accounts match your search.</p>
                      <button onClick={() => {setSearchQuery(''); setStatusFilter('all');}} className="text-sol-yellow font-bold text-[10px] sm:text-sm mt-2 hover:underline">Clear Filters</button>
                    </td>
                  </tr>
                )}

                {!isLoading && staff.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-12 sm:py-16 text-center text-sol-dark/50 text-xs sm:text-sm font-medium">
                      <i className="ti ti-users text-3xl sm:text-4xl text-sol-dark/20 mb-2 sm:mb-3 block"></i>
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