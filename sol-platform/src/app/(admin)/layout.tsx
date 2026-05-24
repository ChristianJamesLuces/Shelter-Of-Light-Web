import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f8f7f2]">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}