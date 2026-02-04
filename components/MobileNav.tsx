"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { 
  Menu, X, BookOpen, FileText, LogOut, 
  Zap, Star, Target, Library, Lock, MessageCircle, ShieldCheck
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
  const { signOut, user } = useAuth() // Usando signOut que é o correto no seu context

  const isInsideCourse = pathname.includes("/course/")
  const courseId = isInsideCourse ? pathname.split("/")[2] : null
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Link do WhatsApp da Master Project
  const whatsappUrl = "https://wa.me/5511999999999"

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
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="fixed inset-y-0 left-0 w-full max-w-[300px] z-[110] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-500">
            
            {/* Header: Perfil e Progresso */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00324F] to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user?.name?.[0] || "U"}
                  </div>
                  <p className="font-black text-gray-900 leading-tight tracking-tighter">
                    {user?.name?.split(" ")[0] || "Aluno"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full hover:bg-gray-100">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Progresso</span>
                  <span className="text-[#00324F]">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>

            {/* Menu Principal: Botões Grandes e Únicos */}
            <nav className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* MEUS CURSOS (Principal) */}
              <Link href="/my-courses" onClick={() => setOpen(false)} 
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all shadow-sm ${pathname === '/my-courses' ? 'bg-[#00324F] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                <BookOpen className="h-6 w-6" /> 
                <span className="font-extrabold text-base">Meus Cursos</span>
              </Link>

              {/* BIBLIOTECA (Azul) */}
              <Link href="/materiais" onClick={() => setOpen(false)} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100 transition-all shadow-sm">
                <Library className="h-6 w-6" />
                <span className="font-extrabold text-base">Biblioteca</span>
              </Link>
              
              {/* ALTERAR SENHA (Laranja) */}
              <Link href="/auth/forgot-password" onClick={() => setOpen(false)} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-orange-50 text-orange-800 border border-orange-100 hover:bg-orange-100 transition-all shadow-sm">
                <Lock className="h-6 w-6" />
                <span className="font-extrabold text-base">Alterar Senha</span>
              </Link>

              {/* SUPORTE VIP (Verde) */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 transition-all shadow-sm">
                <MessageCircle className="h-6 w-6 fill-green-600 text-green-600" />
                <span className="font-extrabold text-base">Suporte VIP</span>
                <Badge className="ml-auto bg-green-600 text-[8px] animate-pulse">ON</Badge>
              </a>

              {/* RETOMAR AULA (Apenas Contexto) */}
              {isInsideCourse && (
                <Link href={`/course/${courseId}`} onClick={() => setOpen(false)} 
                  className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-all">
                  <Zap className="h-6 w-6 fill-white" />
                  <span className="font-extrabold text-base">Retomar Aula</span>
                </Link>
              )}
            </nav>

            {/* Rodapé: Sair */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-4 text-red-500 hover:bg-red-50 rounded-2xl py-7 transition-colors" 
                onClick={signOut} // Função corrigida para o seu context
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