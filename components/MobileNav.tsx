"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import {
  Menu, X, BookOpen, FileText, LogOut,
  Zap, Star, Target, Library, Lock, MessageCircle
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
  const { user, signOut } = useAuth() //
  const isInsideCourse = pathname.includes("/course/")
  const courseId = isInsideCourse ? pathname.split("/")[2] : null
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Link do WhatsApp da Master Project
  const whatsappUrl = "https://wa.me/5511995702066" // Substitua pelo seu número real

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
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs z-[110] bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-500">

            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00324F] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user?.name?.[0] || "U"}
                  </div>
                  <p className="font-black text-gray-900 leading-tight">{user?.name || "Aluno"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* BARRA DE PROGRESSO */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Target className="w-3 h-3" /> Seu Progresso
                  </span>
                  <span className="text-[10px] font-black text-[#00324F]">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>

            <nav className="flex-grow space-y-2 overflow-y-auto pr-2">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[2px] mb-2 ml-2">Menu</p>

              <Link href="/my-courses" onClick={() => setOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === '/my-courses' ? 'bg-[#00324F] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                <BookOpen className="h-5 w-5" /> <span className="font-bold">Meus Cursos</span>
              </Link>

              {/* BIBLIOTECA E ALTERAR SENHA */}
              <div className="mt-4 p-2 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <Link href="/materiais" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white text-gray-700 transition-all group">
                  <Library className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold">Biblioteca</span>
                </Link>

                <Link href="/auth/forgot-password" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white text-gray-700 transition-all">
                  <Lock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold">Alterar Senha</span>
                </Link>
              </div>

              {/* BOTÃO WHATSAPP */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all mt-4">
                <MessageCircle className="h-5 w-5 fill-green-600 text-green-600" />
                <span className="font-bold">Suporte VIP</span>
                <Badge className="ml-auto bg-green-600 text-[8px]">ONLINE</Badge>
              </a>

              {/* BOTÃO RETOMAR AULA (Aparece apenas quando está dentro de um curso) */}
              {isInsideCourse && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <Link href={`/course/${courseId}`} onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 text-orange-700 border border-orange-100">
                    <Zap className="h-5 w-5 fill-orange-500" /> <span className="font-bold">Retomar Aula</span>
                  </Link>
                </div>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 text-red-500 hover:bg-red-50 rounded-2xl py-6"
                onClick={signOut} // Mude de logout para signOut
              >
                <LogOut className="h-5 w-5" />
                <span className="font-bold">Sair da Conta</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}