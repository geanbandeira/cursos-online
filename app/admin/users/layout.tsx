import { SidebarAdmin } from "@/components/admin/SidebarAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Fixa */}
      <SidebarAdmin />

      {/* Conteúdo Dinâmico */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  );
}