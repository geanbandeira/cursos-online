"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, LogOut, GraduationCap, Users } from "lucide-react";

export function SidebarManager() {
  const pathname = usePathname();

  const menuItems = [
  { name: "Dashboard", href: "/gestor/dashboard", icon: LayoutDashboard },
  { name: "Análise Técnica", href: "/gestor/relatorio-tecnico", icon: BarChart3 },
  { name: "Gestão de Time", href: "/gestor/time", icon: Users }, 
];

  return (
    <aside className="hidden md:flex w-64 bg-[#00324F] text-white flex-col fixed inset-y-0 shadow-2xl z-50">
      <div className="p-8">

        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-blue-200/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/10 space-y-2">
        <Link href="/my-courses" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-xs uppercase hover:text-white transition-all">
          <GraduationCap size={18} /> Área do Aluno
        </Link>
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-xs uppercase hover:text-red-300 transition-all w-full text-left">
          <LogOut size={18} /> Sair do Painel
        </button>
      </div>
    </aside>
  );
}