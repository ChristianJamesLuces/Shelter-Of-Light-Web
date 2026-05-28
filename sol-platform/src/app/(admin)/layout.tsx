import AdminNavigation from '@/components/admin/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We use a flex row so the sidebar sits on the left, and the main content fills the right.
    // On mobile (default), it's a column, so the Top Bar sits on top.
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDFBF7]">
        
      {/* Our new Sidebar component */}
      <AdminNavigation />

      {/* The main content area where your pages will load */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}