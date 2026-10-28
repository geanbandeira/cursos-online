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
  linkCartao?: string
  onClose: () => void
}

export default function CheckoutModal({
  courseId,
  userId,
  courseTitle,
  price,
  originalPrice,
  onClose,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // Sempre cria um checkout vinculado ao curso/usuário e com notificações configuradas.
      // O link manual salvo no curso não deve desviar deste fluxo automatizado.
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, userId }),
      })

      const data = await res.json()

      if (!res.ok || !data.checkoutUrl) {
        console.error("[Checkout] Falha ao criar pagamento:", data)
        alert(data.error || "Não foi possível gerar o link de pagamento. Tente novamente.")
        return
      }

      window.location.assign(data.checkoutUrl)
    } catch (error) {
      console.error("[Checkout] Erro de conexão:", error)
      alert("Erro de conexão ao gerar o pagamento. Tente novamente.")
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
            <span className="text-2xl font-black text-[#00324F]">
              {Number(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="text-sm text-gray-400 line-through">
                {Number(originalPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
            Pagamento seguro via PagBank
          </p>
          <p className="text-sm text-gray-600 text-center">
            Na próxima tela, escolha Pix ou cartão de crédito.
          </p>
          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#00324F] hover:bg-[#004A75] text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? "Gerando checkout..." : "Continuar para o PagBank"}
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
