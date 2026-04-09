"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Menu, X, BookOpen, Award, LogOut, Zap, Target, Library, Lock, 
  MessageCircle, User, ShieldCheck, Building2, UserPlus, 
  FileCheck, LayoutDashboard, BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface MobileNavProps {
  completedLessons?: number
  totalLessons?: number
}

export function MobileNav({ completedLessons = 0, totalLessons = 0 }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  const isInsideCourse = pathname.includes("/course/")
  const courseId = isInsideCourse ? pathname.split("/")[2] : null
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const whatsappUrl = "https://wa.me/5511995702066"

  const colors = {
    primary: "#243f51",    // Azul Profundo
    secondary: "#00162e",  // Azul Midnight
    highlight: "#d28027",  // Laranja Cobre
    background: "#fdfefd", // Branco Puro
  }

  // --- CONFIGURAÇÃO DE MENUS POR ROLE ---
  const menuConfig = {
    admin: [
      { label: "Gestão de Usuários", href: "/admin/users", icon: ShieldCheck, color: colors.secondary },
      { label: "Registrar Empresa", href: "/admin/users/registrar-empresa", icon: Building2, color: colors.primary },
      { label: "Vincular Alunos", href: "/admin/users/empresa", icon: UserPlus, color: colors.primary },
      { label: "Central de Certificados", href: "/admin/users/certificates", icon: FileCheck, color: colors.highlight },
    ],
    manager: [
      { label: "Dashboard Gestor", href: "/gestor/dashboard", icon: LayoutDashboard, color: colors.secondary },
      { label: "Performance Técnica", href: "/gestor/relatorio-tecnico", icon: BarChart3, color: colors.primary },
      { label: "Meus Cursos", href: "/my-courses", icon: BookOpen, color: colors.primary },
      { 
        label: "Suporte VIP", 
        href: whatsappUrl, 
        icon: MessageCircle, 
        color: colors.secondary, 
        variant: "solid", 
        isExternal: true, 
        hasBadge: true 
      },
    ],
    student: [
      { label: "Meus Cursos", href: "/my-courses", icon: BookOpen, color: colors.primary, variant: "outlined" },
      { label: "Biblioteca", href: "/materiais", icon: Library, color: colors.secondary, variant: "solid" },
      { label: "Meus Certificados", href: "/meus-certificados", icon: Award, color: colors.primary, variant: "solid" },
      { label: "Meu Perfil", href: "/settings", icon: User, color: colors.primary, variant: "outlined" },
      { 
        label: "Suporte VIP", 
        href: whatsappUrl, 
        icon: MessageCircle, 
        color: colors.secondary, 
        variant: "solid", 
        isExternal: true, 
        hasBadge: true 
      },
      { label: "Alterar Senha", href: "/auth/forgot-password", icon: Lock, color: colors.highlight, variant: "solid" },
    ]
  }

  // Lógica de Role Segura (Evita o erro do .map)
  const role = (user?.role?.toLowerCase() as keyof typeof menuConfig) || "student"
  const currentMenu = menuConfig[role] || menuConfig.student

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="hover:bg-gray-100 z-[60] relative" style={{ color: colors.primary }}>
        <Menu className="h-9 w-9" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="fixed inset-y-0 left-0 w-full max-w-[320px] z-[110] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-500 overflow-y-auto" style={{ backgroundColor: colors.background }}>

            {/* HEADER PERFIL */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20"
                    style={{ background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})` }}>
                    {user?.avatar_url ? <img src={user.avatar_url} alt="Perfil" className="w-full h-full object-cover" /> : user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight">{user?.name?.split(" ")[0] || "Usuário"}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 uppercase font-black" style={{ color: colors.primary, borderColor: colors.primary + "40" }}>
                      {role === 'admin' ? 'Admin Master' : role === 'manager' ? 'Gestor Master' : 'Aluno Master'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="h-8 w-8 text-gray-400" />
                </Button>
              </div>

              {/* BARRA DE PROGRESSO (Sempre visível para o Aluno) */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Progresso Geral</span>
                  <span style={{ color: colors.primary }}>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>

            {/* LINKS DINÂMICOS */}
            <nav className="flex-grow space-y-4">
              {currentMenu.map((item) => {
                const isOutlined = item.variant === "outlined";
                const isActive = pathname === item.href;
                
                // Estilos específicos (igual ao antigo)
                const itemStyle = isOutlined 
                  ? {
                      backgroundColor: isActive ? item.color : colors.background,
                      color: isActive ? colors.background : item.color,
                      borderColor: item.color
                    }
                  : {
                      backgroundColor: item.color,
                      color: "#FFFFFF",
                      borderColor: item.color,
                      boxShadow: item.label === "Meus Certificados" ? "0 10px 15px -3px rgba(0, 50, 79, 0.3)" : "none"
                    };

                if (item.isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-lg border-2 transition-all active:scale-95 font-black text-lg"
                      style={itemStyle}
                    >
                      <item.icon className="h-6 w-6 fill-white" />
                      <span>{item.label}</span>
                      {item.hasBadge && (
                        <Badge className="ml-auto bg-white text-[10px] font-black" style={{ color: item.color }}>ON</Badge>
                      )}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-5 rounded-2xl transition-all shadow-sm border-2 font-black text-lg"
                    style={itemStyle}
                  >
                    <item.icon className="h-6 w-6" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* RETOMAR AULA (Apenas se estiver dentro de um curso) */}
              {isInsideCourse && (
                <Link
                  href={`/course/${courseId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-xl border-2 transition-all active:scale-95 font-black text-lg"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.secondary }}
                >
                  <Zap className="h-6 w-6 fill-white" />
                  <span>Voltar à Aula</span>
                </Link>
              )}
            </nav>

            {/* BOTÃO SAIR */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 text-gray-600 hover:bg-red-50 rounded-2xl py-6 transition-all"
                onClick={() => signOut()}
              >
                <LogOut className="h-6 w-6" />
                <span className="font-black text-lg">Sair da Conta</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}