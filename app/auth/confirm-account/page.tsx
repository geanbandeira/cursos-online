"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { confirmSignUpAction } from "@/lib/auth-actions"
import { useRouter, useSearchParams } from "next/navigation"

export default function ConfirmAccountPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  useEffect(() => {
    if (!email) {
      router.push("/auth/register")
    }
  }, [email, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code || code.length !== 6) {
      setError("Digite o código de 6 dígitos")
      return
    }

    setLoading(true)

    try {
      const result = await confirmSignUpAction(email, code)

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Código inválido")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao confirmar conta")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setCode(value)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta confirmada!</h2>
              <p className="text-gray-600 mb-6">Sua conta foi confirmada com sucesso. Agora você pode fazer login.</p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header com logo e voltar */}
        <div className="text-center mb-8">
          <Link
            href="/auth/register"
            className="inline-flex items-center text-[#00324F] hover:text-[#004066] mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao cadastro
          </Link>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/oie_xpWiKNePpcq7%281%29%281%29%281%29-gE6tp7np2qnWofuIkwOVfK46eagnCh.png"
            alt="Master Project"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Confirme sua conta</h1>
          <p className="text-gray-600 mt-2">Digite o código enviado para seu email</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Verificação de Email
            </CardTitle>
            <CardDescription className="text-center">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de confirmação</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest cursor-pointer"
                  required
                />
                <p className="text-sm text-gray-500 text-center">Digite os 6 dígitos enviados para seu email</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Confirmando..." : "Confirmar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o código?{" "}
                <button className="text-[#00324F] hover:text-[#004066] font-medium cursor-pointer">
                  Reenviar código
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
