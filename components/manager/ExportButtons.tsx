"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportButtonsProps {
  participationData: any[] | null | undefined
  companyName: string
}

export function ExportButtons({ participationData, companyName }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  // Função para limpar o nome do arquivo e evitar o "undefined"
  const getCleanFileName = () => {
    // Se o nome vier como string "undefined" ou estiver vazio, usa um padrão
    if (!companyName || companyName.includes("undefined")) {
      return "Relatorio_MasterProject"
    }
    return companyName.replace(/\s+/g, '_') // Troca espaços por underscore
  }

  const handleExcel = () => {
    try {
      const data = Array.isArray(participationData) ? participationData : []
      if (data.length === 0) return alert("Sem dados para exportar.")

      // DETECTOR: Se o primeiro item tem 'avg_score', é o Relatório Técnico
      const isTechnicalReport = data[0]?.avg_score !== undefined;

      const sanitized = data.map(item => {
        if (isTechnicalReport) {
          return {
            "Setor": String(item?.department || "Geral"),
            "Total de Alunos": item?.total_students || 0,
            "Média de Progresso (%)": `${item?.avg_score || 0}%`
          }
        }
        return {
          "Aluno": String(item?.name || "N/A"),
          "Email": String(item?.email || "N/A"),
          "Setor": String(item?.department || "Geral"),
          "Progresso (%)": `${item?.presenceRate || 0}%`,
          "Status": String(item?.status || "N/A")
        }
      })

      const ws = XLSX.utils.json_to_sheet(sanitized)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio")
      XLSX.writeFile(wb, `${getCleanFileName()}.xlsx`)
    } catch (err) { 
      console.error(err)
      alert("Erro no Excel.") 
    }
  }

  const handlePDF = async () => {
    const data = Array.isArray(participationData) ? participationData : []
    if (data.length === 0) return alert("Sem dados para exportar.")

    setLoading(true)
    const pdf = new jsPDF('p', 'mm', 'a4')

    try {
      const isTechnicalReport = data[0]?.avg_score !== undefined;
      const fileName = getCleanFileName();

      // 1. Cabeçalho do PDF
      pdf.setFontSize(18)
      pdf.setTextColor(0, 50, 79)
      pdf.text("RELATÓRIO DE PERFORMANCE CORPORATIVA", 14, 22)
      
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      // Remove o sufixo do nome da empresa para exibição no texto do PDF
      const displayName = fileName.replace('_Analise_Tecnica', '').replace(/_/g, ' ')
      pdf.text(`Empresa: ${displayName}`, 14, 30)
      pdf.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35)

      // 2. TABELA DE DADOS
      autoTable(pdf, {
        startY: 45,
        // Cabeçalhos dinâmicos conforme o tipo de relatório
        head: isTechnicalReport 
          ? [['Setor', 'Qtd Alunos', 'Progresso Médio']] 
          : [['Aluno', 'Email', 'Setor', 'Progresso', 'Status']],
        
        // Mapeamento de linhas dinâmico
        body: data.map(item => isTechnicalReport ? [
          item.department || 'Geral',
          item.total_students || 0,
          `${item.avg_score}%`
        ] : [
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
        didDrawPage: (pageData) => {
          pdf.setFontSize(8)
          pdf.text(`Página ${pageData.pageNumber}`, pdf.internal.pageSize.getWidth() - 25, pdf.internal.pageSize.getHeight() - 10)
        }
      })

      pdf.save(`${fileName}.pdf`)

    } catch (err) {
      console.error("Erro PDF:", err)
      alert("Erro ao gerar PDF.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleExcel} variant="outline" className="border-emerald-600 text-emerald-600 font-black h-11 px-6 rounded-2xl transition-all hover:bg-emerald-50">
        <FileSpreadsheet className="mr-2 h-4 w-4" /> EXCEL
      </Button>
      <Button onClick={handlePDF} disabled={loading} variant="outline" className="border-blue-600 text-blue-600 font-black h-11 px-6 rounded-2xl transition-all hover:bg-blue-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileText className="mr-2 h-4 w-4" /> PDF</>}
      </Button>
    </div>
  )
}