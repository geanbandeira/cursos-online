"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ExportButtonsProps {
  participationData: any[] | null | undefined
  companyName: string
}

export function ExportButtons({ participationData, companyName }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  const handleExcel = () => {
    try {
      const data = Array.isArray(participationData) ? participationData : []
      if (data.length === 0) return alert("Sem dados para exportar.")
      const sanitized = data.map(item => ({
        "Aluno": String(item?.name || item?.first_name || "N/A"),
        "Email": String(item?.email || "N/A"),
        "Setor": String(item?.department || "Geral"),
        "Progresso": `${item?.progress || 0}%`,
        "Status": String(item?.status || "Ativo")
      }))
      const ws = XLSX.utils.json_to_sheet(sanitized)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio")
      XLSX.writeFile(wb, `Relatorio_${companyName || 'Empresa'}.xlsx`)
    } catch (err) { alert("Erro no Excel.") }
  }

  const handlePDF = async () => {
    const el = document.getElementById('dashboard-content')
    if (!el) return alert("Área de captura não encontrada.")

    setLoading(true)

    // 1. CRIAR UM ESCUDO ANTI-OKLCH (CSS Temporário na página real)
    const antiOklchStyle = document.createElement('style')
    antiOklchStyle.id = "anti-oklch-fix"
    antiOklchStyle.innerHTML = `
      :root {
        --background: 255 255 255 !important;
        --foreground: 0 0 0 !important;
        --card: 255 255 255 !important;
        --primary: 0 50 79 !important; /* Seu azul Master Project */
        --border: 226 232 240 !important;
      }
      /* Força todas as cores para HEX/RGB simples */
      * { 
        color-scheme: light !important;
        background-color: transparent; 
        color: #000000 !important;
      }
      .bg-white, .card, body { background-color: #ffffff !important; }
      .text-white { color: #ffffff !important; }
      .bg-slate-900, .bg-black { background-color: #00324F !important; color: #ffffff !important; }
    `

    try {
      // 2. APLICA O FIX NO DOCUMENTO REAL POR UM INSTANTE
      document.head.appendChild(antiOklchStyle)
      
      // Pequena pausa para o navegador processar a troca de cores
      await new Promise(r => setTimeout(r, 100))

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        // Ignora erros de parsing de cor do html2canvas
        ignoreElements: (element) => element.classList.contains('no-pdf'),
      })

      // 3. REMOVE O FIX (O site volta a ser "moderno" com oklch)
      document.getElementById("anti-oklch-fix")?.remove()

      const img = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const width = pdf.internal.pageSize.getWidth()
      const height = (canvas.height * width) / canvas.width
      
      pdf.addImage(img, 'JPEG', 0, 0, width, height)
      pdf.save(`Dashboard_${companyName}.pdf`)

    } catch (err) {
      console.error("ERRO NO PDF:", err)
      document.getElementById("anti-oklch-fix")?.remove() // Garante a limpeza
      alert("Ainda há um conflito de cores. Tente atualizar a página.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExcel} variant="outline" className="border-emerald-600 text-emerald-600 font-black h-11 px-6 rounded-2xl">
        <FileSpreadsheet className="mr-2 h-4 w-4" /> EXCEL
      </Button>
      <Button onClick={handlePDF} disabled={loading} variant="outline" className="border-blue-600 text-blue-600 font-black h-11 px-6 rounded-2xl">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileText className="mr-2 h-4 w-4" /> PDF</>}
      </Button>
    </div>
  )
}