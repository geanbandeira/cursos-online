"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Menu, X, BookOpen, LogOut, Zap, Target, Library, Lock, MessageCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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

  // Paleta de Cores da Empresa
  const colors = {
    primary: "#243f51",    // Azul Profundo
    secondary: "#00162e",  // Azul Midnight
    highlight: "#d28027",  // Laranja Cobre
    background: "#fdfefd", // Branco Puro
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="hover:bg-gray-100 z-[60] relative"
        style={{ color: colors.primary }}
      >
        <Menu className="h-9 w-9" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-[320px] z-[110] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-500 overflow-y-auto"
            style={{ backgroundColor: colors.background }}
          >
            
            {/* Header: Perfil e Progresso */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})` }}
                  >
                    {user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight">
                      {user?.name?.split(" ")[0] || "Aluno"}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] mt-1 uppercase font-black"
                      style={{ color: colors.primary, borderColor: colors.primary + "40" }}
                    >
                      Aluno Master
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="h-8 w-8 text-gray-400" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Meu Progresso</span>
                  <span style={{ color: colors.primary }}>{progressPercentage}%</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2 bg-gray-200"
                  // Nota: A cor interna do progress geralmente é definida via CSS ou no componente UI
                />
              </div>
            </div>

            {/* Menu: Links Diretos com a Nova Paleta */}
            <nav className="flex-grow space-y-4">
              
              {/* MEUS CURSOS (Cores Primárias) */}
              <a 
                href="/my-courses"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl transition-all shadow-sm border-2 font-black text-lg"
                style={{ 
                  backgroundColor: pathname === '/my-courses' ? colors.primary : colors.background,
                  color: pathname === '/my-courses' ? colors.background : colors.primary,
                  borderColor: colors.primary
                }}
              >
                <BookOpen className="h-6 w-6" /> 
                <span>Meus Cursos</span>
              </a>

              {/* BIBLIOTECA (Azul Midnight para autoridade) */}
              <a 
                href="/materiais"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-lg border-2 transition-all active:scale-95 font-black text-lg"
                style={{ backgroundColor: colors.secondary, borderColor: colors.secondary, shadowColor: colors.secondary + "40" }}
              >
                <Library className="h-6 w-6" />
                <span>Biblioteca</span>
              </a>
              
              {/* ALTERAR SENHA (Laranja Cobre - Destaque de ação) */}
              <a 
                href="/auth/forgot-password"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-lg border-2 transition-all active:scale-95 font-black text-lg"
                style={{ backgroundColor: colors.highlight, borderColor: colors.highlight }}
              >
                <Lock className="h-6 w-6" />
                <span>Alterar Senha</span>
              </a>

              {/* SUPORTE WHATSAPP (Highlight para urgência/suporte) */}
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-lg border-2 transition-all active:scale-95 font-black text-lg"
                style={{ backgroundColor: colors.secondary, borderColor: colors.secondary }}
              >
                <MessageCircle className="h-6 w-6 fill-white" />
                <span>Suporte VIP</span>
                <Badge className="ml-auto bg-white text-[10px] font-black" style={{ color: colors.secondary }}>ON</Badge>
              </a>

              {/* RETOMAR AULA Contextual (Azul Midnight) */}
              {isInsideCourse && (
                <a 
                  href={`/course/${courseId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl text-white shadow-xl border-2 transition-all active:scale-95 font-black text-lg"
                  style={{ backgroundColor: colors.secondary, borderColor: colors.secondary }}
                >
                  <Zap className="h-6 w-6 fill-white" />
                  <span>Voltar à Aula</span>
                </a>
              )}
            </nav>

            {/* Rodapé: Sair */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-4 text-red-600 hover:bg-red-50 rounded-2xl py-8 transition-all" 
                onClick={() => { signOut(); setOpen(false); }}
              >
                <LogOut className="h-6 w-6" /> 
                <span className="font-black text-xl">Sair da Conta</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}