"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle } from "lucide-react"
import { forgotPasswordAction, confirmPasswordAction } from "@/lib/auth-actions"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code" | "success">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await forgotPasswordAction(email)
      if (result.success) {
        setStep("code")
      } else {
        setError(result.error || "Erro ao enviar código de recuperação")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao enviar código de recuperação")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmNewPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const result = await confirmPasswordAction(email, code, newPassword)
      if (result.success) {
        setStep("success")
      } else {
        setError(result.error || "Erro ao redefinir senha")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  const renderEmailStep = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-12 h-12 bg-[#00324F] rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl">Recuperar senha</CardTitle>
        <CardDescription>Digite seu email para receber o código de recuperação</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendCode} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-[#00324F] hover:text-[#004066] cursor-pointer">
            Voltar para login
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  const renderCodeStep = () => (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Código enviado</CardTitle>
        <CardDescription>Verifique seu email e digite o código de recuperação junto com sua nova senha</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código de verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="Digite o código recebido"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="pr-10 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setStep("email")}
            className="text-sm text-[#00324F] hover:text-[#004066] cursor-pointer"
          >
            Não recebeu o código? Tentar novamente
          </button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="shadow-lg border-0 text-center">
      <CardContent className="pt-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
        <p className="text-gray-600 mb-6">
          Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
        </p>
        <Link href="/auth/login">
          <Button className="w-full bg-[#00324F] hover:bg-[#004066] text-white cursor-pointer">Fazer login</Button>
        </Link>
      </CardContent>
    </Card>
  )

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
        </div>

        {step === "email" && renderEmailStep()}
        {step === "code" && renderCodeStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  )
}
