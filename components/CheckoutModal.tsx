"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard } from "lucide-react"

interface CheckoutModalProps {
  courseId: string | number
  userId: string | number
  courseTitle: string
  price: number | string
  originalPrice?: number | string
  // Mantido por compatibilidade com os componentes que ainda enviam esta propriedade.
  // O pagamento agora sempre é criado pelo backend PagBank; links manuais não são usados.
  linkCartao?: string
  onClose: () => void
}

export default function CheckoutModal({
  courseId,
  courseTitle,
  price,
  originalPrice,
  onClose,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleCheckout = async () => {
    setLoading(true)
    setErrorMessage("")

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("[Checkout] Falha ao criar checkout", {
          status: res.status,
          code: data.code,
          requestId: data.requestId,
          details: data.details,
        })
        setErrorMessage(
          data.requestId
            ? `${data.error || "Não foi possível iniciar o pagamento."} Código: ${data.requestId}`
            : data.error || "Não foi possível iniciar o pagamento."
        )
        return
      }

      if (typeof data.checkoutUrl !== "string" || !data.checkoutUrl.startsWith("https://")) {
        console.error("[Checkout] Resposta sem URL válida", data)
        setErrorMessage("O PagBank não retornou um link de pagamento válido. Tente novamente.")
        return
      }

      window.location.assign(data.checkoutUrl)
    } catch (error) {
      console.error("[Checkout] Erro de conexão", error)
      setErrorMessage("Erro de conexão ao iniciar o pagamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-[#00324F]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Adquira o Curso</h2>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center mb-6">
          <h3 className="font-bold text-base text-gray-900 mb-1">{courseTitle}</h3>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-black text-[#00324F]">R$ {price}</span>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="text-sm text-gray-400 line-through">R$ {originalPrice}</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
            Finalizar Compra
          </p>
          <p className="text-xs text-gray-500 text-center">
            Pagamento seguro pelo PagBank com cartão de crédito ou Pix.
          </p>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#00324F] hover:bg-[#004A75] text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? "Conectando ao PagBank..." : "Pagar com PagBank"}
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-4 text-gray-500 font-bold hover:bg-gray-50 h-11 rounded-xl"
          onClick={onClose}
          disabled={loading}
        >
          Fechar
        </Button>
      </div>
    </div>
  )
}
