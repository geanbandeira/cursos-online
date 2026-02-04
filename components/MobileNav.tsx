"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation" // Importamos o roteador
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
  const router = useRouter() // Inicializamos o router
  const { signOut, user } = useAuth()

  const isInsideCourse = pathname.includes("/course/")
  const courseId = isInsideCourse ? pathname.split("/")[2] : null
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const whatsappUrl = "https://wa.me/5511995702066" // Altere para o seu número

  // FUNÇÃO DE NAVEGAÇÃO INTELIGENTE PARA 2026
  const handleNavigate = (href: string) => {
    // 1. O menu não fecha na hora, damos 100ms para o roteador registrar o destino
    router.push(href);
    setTimeout(() => {
      setOpen(false);
    }, 150);
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="hover:bg-gray-100 z-[60] relative shrink-0"
      >
        <Menu className="h-9 w-9 text-[#00324F]" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="fixed inset-y-0 left-0 w-full max-w-[320px] z-[110] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-500 overflow-y-auto">
            
            {/* Header: Perfil e Progresso */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00324F] to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight">
                      {user?.name?.split(" ")[0] || "Aluno"}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1 text-blue-600 border-blue-200">ALUNO MASTER</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="h-8 w-8" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Meu Progresso</span>
                  <span className="text-[#00324F]">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>

            {/* Menu: Botões Grandes e Únicos */}
            <nav className="flex-grow space-y-4">
              
              {/* MEUS CURSOS */}
              <button 
                onClick={() => handleNavigate('/my-courses')}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-95 shadow-sm border-2 ${
                  pathname === '/my-courses' ? 'bg-[#00324F] text-white border-[#00324F]' : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="h-6 w-6" /> 
                <span className="font-extrabold text-lg tracking-tight">Meus Cursos</span>
              </button>

              {/* BIBLIOTECA (Azul) */}
              <button 
                onClick={() => handleNavigate('/materiais')}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-95 shadow-sm border-2 ${
                  pathname === '/materiais' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-200'
                }`}
              >
                <Library className="h-6 w-6" />
                <span className="font-extrabold text-lg tracking-tight">Biblioteca</span>
              </button>
              
              {/* ALTERAR SENHA (Laranja) */}
              <button 
                onClick={() => handleNavigate('/auth/forgot-password')}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-orange-50 text-orange-800 border-2 border-orange-100 shadow-sm transition-all active:scale-95 hover:bg-orange-100"
              >
                <Lock className="h-6 w-6" />
                <span className="font-extrabold text-lg tracking-tight">Alterar Senha</span>
              </button>

              {/* SUPORTE WHATSAPP (Verde) */}
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 text-green-800 border-2 border-green-200 shadow-sm transition-all active:scale-95 hover:bg-green-100"
              >
                <MessageCircle className="h-6 w-6 fill-green-600 text-green-600" />
                <span className="font-extrabold text-lg tracking-tight">Suporte VIP</span>
                <Badge className="ml-auto bg-green-600 text-[10px] animate-pulse">LIVE</Badge>
              </a>

              {/* RETOMAR AULA Contextual */}
              {isInsideCourse && (
                <button 
                  onClick={() => handleNavigate(`/course/${courseId}`)}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-black text-white shadow-xl transition-all active:scale-95"
                >
                  <Zap className="h-6 w-6 fill-white" />
                  <span className="font-extrabold text-lg tracking-tight">Voltar à Aula</span>
                </button>
              )}
            </nav>

            {/* Rodapé: Sair */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-4 text-red-600 hover:bg-red-50 rounded-2xl py-8 transition-all active:scale-95" 
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