"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

interface ExportButtonsProps {
  participationData: any[] | null | undefined
  companyName: string
}

export function ExportButtons({ participationData, companyName }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  // EXCEL (Já está funcionando 100%)
  const handleExcel = () => {
    try {
      const data = Array.isArray(participationData) ? participationData : []
      if (data.length === 0) return alert("Sem dados para exportar.")
      const sanitized = data.map(item => ({
        "Aluno": String(item?.name || "N/A"),
        "Email": String(item?.email || "N/A"),
        "Setor": String(item?.department || "Geral"),
        "Progresso (%)": `${item?.presenceRate || 0}%`,
        "Status": String(item?.status || "N/A")
      }))
      const ws = XLSX.utils.json_to_sheet(sanitized)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio")
      XLSX.writeFile(wb, `Relatorio_${companyName}.xlsx`)
    } catch (err) { alert("Erro no Excel.") }
  }

  // PDF HÍBRIDO (GRÁFICOS + TABELA DE DADOS)
  const handlePDF = async () => {
    const data = Array.isArray(participationData) ? participationData : []
    if (data.length === 0) return alert("Sem dados para exportar.")

    setLoading(true)
    const pdf = new jsPDF('p', 'mm', 'a4')

    try {
      // 1. Cabeçalho do PDF
      pdf.setFontSize(18)
      pdf.setTextColor(0, 50, 79) // Azul Master Project
      pdf.text("RELATÓRIO DE PERFORMANCE CORPORATIVA", 14, 22)
      
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      pdf.text(`Empresa: ${companyName}`, 14, 30)
      pdf.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35)

      // 2. Captura opcional dos Gráficos (Apenas se houver um ID para eles)
      // Se você quiser capturar os gráficos, coloque um ID="charts-area" neles
      const chartsEl = document.getElementById('charts-area')
      let yPos = 45

      if (chartsEl) {
        const canvas = await html2canvas(chartsEl, { scale: 1, useCORS: true })
        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth() - 28
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, 'JPEG', 14, yPos, pdfWidth, pdfHeight)
        yPos += pdfHeight + 10
      }

      // 3. GERANDO A TABELA DE DADOS (Inquebrável)
      autoTable(pdf, {
        startY: yPos,
        head: [['Aluno', 'Email', 'Setor', 'Progresso', 'Status']],
        body: data.map(item => [
          item.name,
          item.email,
          item.department || 'Geral',
          `${item.presenceRate}%`,
          item.status
        ]),
        headStyles: { fillColor: [0, 50, 79], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { top: 20 },
        didDrawPage: (data) => {
          // Rodapé em todas as páginas
          pdf.setFontSize(8)
          pdf.text(`Página ${data.pageNumber}`, pdf.internal.pageSize.getWidth() - 25, pdf.internal.pageSize.getHeight() - 10)
        }
      })

      pdf.save(`Relatorio_Performance_${companyName}.pdf`)

    } catch (err) {
      console.error("Erro PDF:", err)
      alert("Erro ao gerar PDF. Use o Excel.")
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