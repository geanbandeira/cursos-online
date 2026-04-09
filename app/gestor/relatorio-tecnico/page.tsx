"use client"

import React, { useEffect, useState } from "react"
import { RoleGuard } from "@/components/auth/RoleGuard"
import { useAuth } from "@/contexts/AuthContext"
import { getCompanyTechnicalStats } from "@/lib/course-actions"
import { ExportButtons } from "@/components/manager/ExportButtons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, Trophy, AlertTriangle, ArrowUpRight, 
  BrainCircuit, ChevronLeft, Loader2, Zap 
} from "lucide-react"
import Link from "next/link"

export default function RelatorioTecnicoPage() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<{ranking: any[], talents: any[]}>({ ranking: [], talents: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // 1. Logs de Debug (Verifique no F12 Console)
      console.log("Estado Auth:", { authLoading, hasUser: !!user, companyId: user?.company_id });

      // Se ainda está carregando o login, não faz nada
      if (authLoading) return;

      // Se o login terminou e NÃO tem usuário, para o loading
      if (!user) {
        console.error("Usuário não encontrado.");
        setLoading(false);
        return;
      }

      // Se tem usuário mas não tem empresa, para o loading e avisa
      if (!user.company_id) {
        console.warn("Usuário sem empresa vinculada.");
        setLoading(false);
        return;
      }

      try {
        console.log("Buscando dados no SQL para ID:", user.company_id);
        const res = await getCompanyTechnicalStats(Number(user.company_id));
        
        if (res.success) {
          console.log("Dados recebidos com sucesso:", res);
          setData({ 
            ranking: Array.isArray(res.ranking) ? res.ranking : [], 
            talents: Array.isArray(res.talents) ? res.talents : [] 
          });
        } else {
          console.error("Erro retornado pela Action:", res.error);
        }
      } catch (err) {
        console.error("Erro catastrófico na chamada API:", err);
      } finally {
        // ESSENCIAL: O loading para aqui, independente de sucesso ou erro
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  // Se estiver carregando o Auth OU os Dados
  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#00324F]" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Sincronizando BI Enterprise...
        </p>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="p-8 space-y-8 bg-slate-50 min-h-screen pb-24 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <Link href="/gestor/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-[#00324F] font-black text-[10px] transition-all uppercase tracking-tighter mb-2">
              <ChevronLeft size={14} /> Painel Institucional
            </Link>
            <h1 className="text-4xl font-black text-[#00324F] tracking-tighter uppercase">Análise Profunda</h1>
            <p className="text-slate-500 font-medium">Empresa: <span className="font-bold text-[#00324F]">{user?.company_name || 'Master Project'}</span></p>
          </div>
          <ExportButtons 
            participationData={data.ranking} 
            companyName={`${user?.company_name || 'Relatorio'}_Performance`} 
          />
        </div>
        {/* CONTEÚDO PARA CAPTURA (Onde o ID do PDF deve estar) */}
        <div id="dashboard-content" className="space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* RANKING DE PERFORMANCE */}
            <Card className="xl:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="bg-[#00324F] text-white p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                      <BarChart3 size={24} /> Ranking Setorial
                    </CardTitle>
                    <CardDescription className="text-slate-300">Progresso médio por departamento</CardDescription>
                  </div>
                  <Zap className="text-blue-900 opacity-20" size={60} />
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {data.ranking.length > 0 ? data.ranking.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black text-slate-200 group-hover:text-blue-300 transition-colors">0{i+1}</span>
                      <div>
                        <p className="font-black text-[#00324F] uppercase text-sm">{s.department || "Geral"}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">{s.total_students} ALUNOS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#00324F]">{Math.round(s.avg_score)}%</p>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${s.avg_score >= 70 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                            style={{ width: `${s.avg_score}%` }} 
                          />
                        </div>
                      </div>
                      {s.avg_score < 40 && <AlertTriangle className="text-red-500 animate-pulse" size={24} />}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">Aguardando processamento de dados...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TOP 3 TALENTOS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Trophy className="text-blue-600" size={20} />
                <h2 className="text-sm font-black text-[#00324F] uppercase tracking-widest">Identificação de Talentos</h2>
              </div>
              
              {data.talents.map((t, i) => (
                <Card key={i} className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden relative group">
                  <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-[#00324F] group-hover:scale-125 transition-all">
                    <BrainCircuit size={120} />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-[#00324F] text-[9px] font-black tracking-widest px-3">RANK {i+1}</Badge>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">{Math.round(t.avg_score)}%</span>
                    </div>
                    <h4 className="text-lg font-black text-[#00324F] uppercase leading-none">{t.first_name} {t.last_name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic">{t.department}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                       <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-all">
                          PERFIL TÉCNICO <ArrowUpRight size={14} />
                       </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>

      </div>
    </RoleGuard>
  )
}