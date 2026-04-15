import React from "react"
import { redirect } from "next/navigation"
import { getCurrentManager } from "@/lib/auth-actions"
import { getCompanyTechnicalStats } from "@/lib/course-actions"
import { ExportButtons } from "@/components/manager/ExportButtons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, Trophy, ArrowUpRight, BrainCircuit, 
  ChevronLeft, Zap, Target, Star, Users 
} from "lucide-react"
import Link from "next/link"

export default async function RelatorioTecnicoPage() {
  // 1. AUTENTICAÇÃO (Igual ao Dashboard que já funciona)
  const manager = await getCurrentManager();
  if (!manager || !manager.companyId) redirect("/auth/login");

  // 2. BUSCA DE DADOS REAIS NO BANCO
  const stats = await getCompanyTechnicalStats(manager.companyId);
  const ranking = stats.success ? stats.ranking : [];
  const talents = stats.success ? stats.talents : [];

  // 3. CÁLCULO DE SCORE GLOBAL (FIXED: Converte para número para evitar NaN%)
  const globalScore = ranking.length > 0 
    ? Math.round(ranking.reduce((acc: number, curr: any) => acc + Number(curr.avg_score || 0), 0) / ranking.length)
    : 0;

  return (
    <div className="p-8 space-y-8 pb-32">
      
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#00324F] tracking-tighter uppercase leading-none">Análise Técnica</h1>
          <p className="text-slate-500 font-medium">Monitoramento: <span className="font-bold text-[#00324F] uppercase">{manager.companyName}</span></p>
        </div>
        <ExportButtons 
          participationData={ranking} 
          companyName={`${manager.companyName}_Analise_Tecnica`} 
        />
      </div>

      <div id="dashboard-content" className="space-y-8">
        
        {/* CARDS KPI PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-2xl bg-[#00324F] text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute right-[-10px] top-[-10px] opacity-10"><Target size={180} /></div>
            <CardContent className="p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-6">Score de Domínio Técnico Global</p>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black tracking-tighter">{globalScore}%</span>
                <Badge className="bg-emerald-500 text-white font-black px-4 py-1 rounded-full text-xs uppercase">Validado 2026</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-4 rounded-3xl mb-4"><Users className="text-blue-600 w-8 h-8" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Departamentos<br/>Ativos</p>
            <p className="text-5xl font-black text-[#00324F] mt-2">{ranking.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* RANKING SETORIAL */}
          <Card className="xl:col-span-2 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-8 border-b">
              <CardTitle className="text-xl font-black text-[#00324F] uppercase tracking-tight flex items-center gap-2">
                <BarChart3 size={20} /> Performance por Setor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {ranking.length > 0 ? ranking.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">0{i+1}</span>
                    <div>
                      <p className="font-black text-[#00324F] uppercase text-sm">{s.department}</p>
                      <p className="text-[9px] font-bold text-slate-400 tracking-widest">{s.total_students} COLABORADORES</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#00324F] tracking-tighter">{Math.round(s.avg_score)}%</p>
                    <div className="w-32 bg-slate-200 h-2 rounded-full mt-2 overflow-hidden shadow-inner">
                      <div className={`h-full ${s.avg_score >= 70 ? 'bg-emerald-500' : 'bg-[#00324F]'}`} style={{ width: `${s.avg_score}%` }} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed">
                  <p className="text-slate-400 font-black text-xs tracking-widest uppercase">Nenhum dado capturado para {manager.companyName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TOP TALENTOS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Trophy className="text-yellow-500" size={20} />
              <h2 className="text-xs font-black text-[#00324F] uppercase tracking-[0.2em]">Top Talentos</h2>
            </div>
            
            {talents.length > 0 ? talents.map((t: any, i: number) => (
              <Card key={i} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute right-[-15px] bottom-[-15px] opacity-5 text-[#00324F] group-hover:scale-110 transition-transform">
                  <BrainCircuit size={150} />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-[#00324F] text-[9px] font-black px-4 py-1 rounded-full">RANK {i+1}</Badge>
                    <span className="text-3xl font-black text-blue-600 tracking-tighter">{Math.round(t.avg_score)}%</span>
                  </div>
                  <h4 className="text-xl font-black text-[#00324F] uppercase tracking-tighter leading-none">{t.first_name} {t.last_name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{t.department}</p>
                  <div className="mt-8 pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                       Matriz de Domínio Técnica <ArrowUpRight size={14} />
                     </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pt-10 italic">Processando talentos...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}