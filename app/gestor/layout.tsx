import { SidebarManager } from "@/components/manager/SidebarManager";

export default function GestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Menu Lateral que vamos criar abaixo */}
      <SidebarManager />

      {/* Conteúdo das páginas (Dashboard / Relatório) */}
      <main className="flex-1 md:ml-64 p-4 md:p-0">
        {children}
      </main>
    </div>
  );
}