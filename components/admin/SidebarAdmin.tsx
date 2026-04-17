"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Adicionado useRouter
import { useAuth } from "@/contexts/AuthContext"; // Adicionado useAuth
import { signOutAction } from "@/lib/auth-actions"; // Adicionado signOutAction
import { 
  Users, 
  Building2, 
  Factory, 
  Award, 
  LogOut, 
  ArrowLeft 
} from "lucide-react";

export function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useAuth(); // Para limpar o usuário no navegador

  // FUNÇÃO QUE FAZ O BOTÃO FUNCIONAR
  const handleLogout = async () => {
    try {
      await signOutAction(); // Deleta o cookie no servidor
      setUser(null); // Limpa o estado no cliente
      router.push("/auth/login"); // Manda pro login
      router.refresh(); // Atualiza a página
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  const menuItems = [
    { name: "Lista de Usuários", href: "/admin/users", icon: Users },
    { name: "Registrar Empresa", href: "/admin/users/registrar-empresa", icon: Building2 },
    { name: "Gestão de Empresas", href: "/admin/users/empresa", icon: Factory },
    { name: "Central Certificados", href: "/admin/users/certificates", icon: Award },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col fixed inset-y-0 shadow-2xl z-50">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Users size={20} className="text-white" />
          </div>
          <span className="font-black text-sm uppercase tracking-tighter">Admin Master</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                  isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
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
        <Link href="/my-courses" className="flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-[11px] uppercase hover:text-white transition-all">
          <ArrowLeft size={18} /> Voltar ao Site
        </Link>
        
        {/* BOTÃO COM O ONCLICK ADICIONADO */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-[11px] uppercase hover:text-red-300 transition-all w-full text-left cursor-pointer"
        >
          <LogOut size={18} /> Sair Admin
        </button>
      </div>
    </aside>
  );
} 