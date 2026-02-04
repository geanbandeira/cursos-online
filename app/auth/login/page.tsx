"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react"
import { signInAction, getUserFromToken } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signInAction(email, password)

      if (result.success && result.data.AuthenticationResult?.AccessToken) {
        const userResult = await getUserFromToken(result.data.AuthenticationResult.AccessToken)

        if (userResult.success) {
          setUser(userResult.data)
          router.push("/my-courses") // Redireciona para a página principal após login
        } else {
          setError("Erro ao obter dados do usuário")
        }
      } else {
        setError(result.error || "Erro ao fazer login")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com logo e voltar */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-[#00324F] hover:text-[#004066] mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/oie_xpWiKNePpcq7%281%29%281%29%281%29-gE6tp7np2qnWofuIkwOVfK46eagnCh.png"
            alt="Master Project"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Entrar na sua conta</h1>
          <p className="text-gray-600 mt-2">Acesse seus cursos e continue aprendendo</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Login</CardTitle>
            <CardDescription className="text-center">Digite suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#00324F] hover:text-[#004066] cursor-pointer"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* --- SEÇÃO "MEU PRIMEIRO ACESSO" PADRÃO 2026 --- */}
<div className="mt-8 space-y-6">
  {/* Separador Elegante */}
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-gray-200"></span>
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-4 text-gray-400 font-semibold tracking-widest">
        Novo por aqui?
      </span>
    </div>
  </div>

  {/* Botão Chamativo e Moderno */}
  <Link href="/auth/register" className="block w-full group">
    <Button
      variant="outline"
      className="w-full py-7 border-2 border-[#00324F] text-[#00324F] hover:bg-[#00324F] hover:text-white transition-all duration-500 rounded-2xl font-black text-lg gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95"
    >
      <UserPlus className="w-6 h-6 transition-transform group-hover:scale-125" />
      Meu primeiro acesso
    </Button>
  </Link>
  
  <p className="text-center text-xs text-gray-400">
    Crie sua conta em menos de 1 minuto e comece a estudar.
  </p>
</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
