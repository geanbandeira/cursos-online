"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress" // Certifique-se de ter o componente Progress do Shadcn
import { 
  Award, 
  TrendingUp, 
  Target, 
  Users, 
  ChevronRight, 
  Zap,
  BarChart3,
  BrainCircuit
} from "lucide-react"

export function TechnicalPerformance({ performanceData }: { performanceData: any }) {
  // Simulando dados que viriam do seu banco
  const categories = [
    { name: "Liderança e Soft Skills", score: 85, trend: "+5%", color: "bg-emerald-500" },
    { name: "Processos Internos", score: 62, trend: "-2%", color: "bg-orange-500" },
    { name: "Ferramentas Técnicas", score: 78, trend: "+12%", color: "bg-blue-500" },
    { name: "Compliance e Segurança", score: 91, trend: "0%", color: "bg-indigo-500" },
  ]

  return (
    <div className="space-y-6">
      {/* 1. HERO CARD: O RESUMO EXECUTIVO */}
      <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
        <div className="absolute right-[-20px] top-[-20px] p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <BrainCircuit size={200} />
        </div>
        
        <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Badge className="bg-blue-500 text-white border-none px-3">LIVE STATS</Badge>
              <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Performance Global</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">Média de Proficiência: <span className="text-blue-400">74.8%</span></h3>
            <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
              O time de <strong>Vendas</strong> superou a meta trimestral em 15%. 
              Recomendamos foco em <em>Processos Internos</em> para o setor administrativo.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500" size={16} />
                <span className="text-xs font-bold">Meta: 80%</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-emerald-500" size={16} />
                <span className="text-xs font-bold">420 Alunos Avaliados</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl flex items-center gap-2 active:scale-95">
              DETALHAR RELATÓRIO <ChevronRight size={18} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. GRID DE CATEGORIAS: A MATRIZ DE DOMÍNIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.name} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${cat.color} bg-opacity-10`}>
                  <Zap size={20} className={cat.color.replace('bg-', 'text-')} />
                </div>
                <Badge variant="outline" className={`text-[10px] ${cat.trend.includes('+') ? 'text-emerald-600 border-emerald-100' : 'text-orange-600 border-orange-100'}`}>
                  {cat.trend}
                </Badge>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{cat.name}</p>
                <h4 className="text-2xl font-black text-slate-900">{cat.score}%</h4>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Score Atual</span>
                  <span>Objetivo: 85%</span>
                </div>
                <Progress value={cat.score} className="h-1.5" indicatorColor={cat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. INSIGHT DE IA (O toque de 2026) */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4">
        <div className="bg-blue-600 p-2 rounded-full text-white">
          <TrendingUp size={16} />
        </div>
        <div>
          <p className="text-xs font-bold text-blue-900 uppercase">Insight do Consultor IA</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            Detectamos que 80% dos erros na categoria <strong>Ferramentas Técnicas</strong> ocorrem na segunda-feira. 
            Considere agendar um reforço de conteúdo via e-mail nas manhãs de segunda.
          </p>
        </div>
      </div>
    </div>
  )
}