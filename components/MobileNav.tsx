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

  const whatsappUrl = "https://wa.me/5511995702066" // Altere para o seu número

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="hover:bg-gray-100 z-[60] relative"
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
                    <Badge variant="outline" className="text-[10px] mt-1 text-blue-600 border-blue-200 uppercase font-black">Aluno Master</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="h-8 w-8 text-gray-400" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Meu Progresso</span>
                  <span className="text-[#00324F]">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>

            {/* Menu: Links Diretos (Tag <a>) para Navegação Forçada */}
            <nav className="flex-grow space-y-4">
              
              {/* MEUS CURSOS */}
              <a 
                href="/my-courses"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all shadow-sm border-2 ${
                  pathname === '/my-courses' ? 'bg-[#00324F] text-white border-[#00324F]' : 'bg-gray-50 text-gray-700 border-gray-100'
                }`}
              >
                <BookOpen className="h-6 w-6" /> 
                <span className="font-black text-lg">Meus Cursos</span>
              </a>

              {/* BIBLIOTECA (Link Direto) */}
              <a 
                href="/materiais"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 border-2 border-blue-600 transition-all active:scale-95"
              >
                <Library className="h-6 w-6" />
                <span className="font-black text-lg">Biblioteca</span>
              </a>
              
              {/* ALTERAR SENHA (Link Direto) */}
              <a 
                href="/auth/forgot-password"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 border-2 border-orange-500 transition-all active:scale-95"
              >
                <Lock className="h-6 w-6" />
                <span className="font-black text-lg">Alterar Senha</span>
              </a>

              {/* SUPORTE WHATSAPP */}
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-green-600 text-white shadow-lg shadow-green-200 border-2 border-green-600 transition-all active:scale-95"
              >
                <MessageCircle className="h-6 w-6 fill-white text-green-600" />
                <span className="font-black text-lg">Suporte VIP</span>
                <Badge className="ml-auto bg-white text-green-600 text-[10px] font-black">LIVE</Badge>
              </a>

              {/* RETOMAR AULA Contextual */}
              {isInsideCourse && (
                <a 
                  href={`/course/${courseId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-black text-white shadow-xl border-2 border-black transition-all active:scale-95"
                >
                  <Zap className="h-6 w-6 fill-white text-white" />
                  <span className="font-black text-lg">Voltar à Aula</span>
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