import React from "react";
import { redirect } from "next/navigation";
import { ParticipationTable } from "@/components/manager/ParticipationTable";
import { CompletionChart } from "@/components/manager/CompletionChart";
import { ActivationChart } from "@/components/manager/ActivationChart";
import { ExportButtons } from "@/components/manager/ExportButtons";
import { Trophy} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  getManagerParticipationReport, 
  getDailyCompletionTrend, 
  getActivationByDepartment, 
  getCompanyCompetencyMap 
} from "@/lib/course-actions";
import { getCurrentManager } from "@/lib/auth-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  BarChart3, 
  Zap 
} from "lucide-react";

export default async function ManagerDashboardPage() {
  // 1. AUTENTICAÇÃO E DADOS
  const manager = await getCurrentManager();
  if (!manager || !manager.companyId) redirect("/auth/login");

  const companyId = manager.companyId;

  const [participationData, trendData, activationData, competencyData] = await Promise.all([
    getManagerParticipationReport(companyId),
    getDailyCompletionTrend(companyId),
    getActivationByDepartment(companyId),
    getCompanyCompetencyMap(companyId)
  ]);

  // 2. CÁLCULOS DE PERFORMANCE
  const totalStudents = participationData.length;
  const avgCompletion = totalStudents > 0
    ? participationData.reduce((acc, curr) => acc + (curr.presenceRate || 0), 0) / totalStudents
    : 0;
  const totalAulasAssistidas = participationData.reduce((acc, curr) => acc + (curr.lessons_completed || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 bg-slate-50 min-h-screen">
      
      {/* --- HEADER (NÃO SAI NO PDF) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Olá, {manager.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Gestão Institucional: <span className="text-[#00324F] font-bold">{manager.companyName}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Exportar Relatórios</p>
          <ExportButtons
            participationData={participationData}
            companyName={manager.companyName}
          />
        </div>
      </div>

      {/* --- ÁREA DE CAPTURA (TUDO DAQUI PARA BAIXO VAI PARA O PDF) --- */}
      <div id="dashboard-content" className="space-y-8 p-2">
        
        {/* Título Visível apenas no PDF ou Impressão */}
        <div className="hidden block-in-pdf mb-6 border-b-2 pb-4">
          <h2 className="text-2xl font-black text-[#00324F] uppercase">Relatório Master Project - 2026</h2>
          <p className="text-slate-500 font-bold">Empresa: {manager.companyName}</p>
        </div>

        {/* 1. CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Alunos Ativos" value={totalStudents.toString()} icon={<Users />} />
          <StatsCard title="Engajamento Médio" value={`${avgCompletion.toFixed(1)}%`} icon={<GraduationCap />} />
          <StatsCard title="Aulas Concluídas" value={totalAulasAssistidas.toString()} icon={<CheckCircle2 />} color="text-green-600" />
          <StatsCard title="Status do Plano" value="Enterprise" icon={<Award />} color="text-blue-600" />
        </div>

        
        {/* 3. ANÁLISES VISUAIS (GRÁFICOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl border-none bg-white rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} /> Ritmo de Conclusão Diário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompletionChart data={trendData} />
            </CardContent>
          </Card>

          <Card className="shadow-xl border-none bg-white rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <BarChart3 size={16} /> Adesão por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivationChart data={activationData} />
            </CardContent>
          </Card>
        </div>

        {/* 4. RELATÓRIO NOMINAL (TABELA) */}
        <Card className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-none">
          <CardHeader className="border-b bg-slate-900 text-white p-6">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Relatório Nominal de Desempenho</CardTitle>
          </CardHeader>
          <div className="p-2">
            <ParticipationTable data={participationData} />
          </div>
        </Card>

      </div> {/* --- FIM DA ÁREA DE CAPTURA --- */}

    </div>
  );
}

// COMPONENTE DE CARD DE ESTATÍSTICA
function StatsCard({ title, value, icon, color = "text-slate-600" }: { title: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <Card className="border-none shadow-md bg-white hover:shadow-xl transition-all rounded-3xl overflow-hidden group">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-slate-100 ${color}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{title}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}