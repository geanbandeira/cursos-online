"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, Smartphone, FileText } from "lucide-react"

interface CheckoutModalProps {
  courseTitle: string
  price: number | string
  originalPrice?: number | string
  linkPix?: string
  linkCartao?: string
  linkBoleto?: string
  onClose: () => void
}

export default function CheckoutModal({
  courseTitle,
  price,
  originalPrice,
  linkPix,
  linkCartao,
  linkBoleto,
  onClose,
}: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-[#00324F]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Adquira o Curso</h2>
          <p className="text-sm text-gray-600">Desbloqueie todas as aulas agora mesmo.</p>
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
            Escolha a forma de pagamento
          </p>

          {/* Cartão de Crédito */}
          {linkCartao && (
            <a href={linkCartao} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full bg-[#00324F] hover:bg-[#004A75] text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-md">
                <CreditCard className="w-4 h-4 mr-2" />
                Cartão de Crédito
              </Button>
            </a>
          )}

          {/* PIX */}
          {linkPix && (
            <a href={linkPix} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-md">
                <Smartphone className="w-4 h-4 mr-2" />
                PIX
              </Button>
            </a>
          )}

          {/* Boleto */}
          {linkBoleto && (
            <a href={linkBoleto} target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-4 h-4 mr-2" />
                Boleto Bancário
              </Button>
            </a>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full mt-4 text-gray-500 font-bold hover:bg-gray-50 h-11 rounded-xl"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </div>
  )
}