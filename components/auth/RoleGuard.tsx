"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("admin" | "manager" | "student")[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // 1. Se não estiver logado, manda pro login
      if (!user) {
        router.push("/auth/login")
        return
      }

      // 2. Se a role do usuário não estiver na lista permitida, manda pro dashboard básico
      if (!allowedRoles.includes(user.role as any)) {
        router.push("/dashboard") // Ou uma página de "Acesso Negado"
      }
    }
  }, [user, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#00324F]" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Verificando Credenciais...</p>
      </div>
    )
  }

  // Se o usuário não existe ou a role é errada, não renderiza nada enquanto o useEffect redireciona
  if (!user || !allowedRoles.includes(user.role as any)) {
    return null
  }

  return <>{children}</>
}