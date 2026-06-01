import AdminNavigation from '@/components/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FIX: Changed from md:flex-row to lg:flex-row. 
    // Now tablets get the full-screen mobile view, giving your data 100% of the screen width!
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFBF7] overflow-hidden">
        
      <AdminNavigation />

      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}