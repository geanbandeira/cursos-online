import React from "react"
import { redirect } from "next/navigation"
import { getCurrentManager } from "@/lib/auth-actions"
import { getManagerSkillGapAnalysis } from "@/lib/course-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingDown, ShieldCheck, ChevronRight, Lightbulb, Zap } from "lucide-react"

export default async function SkillGapPage() {
  const manager = await getCurrentManager();
  if (!manager || !manager.companyId) redirect("/auth/login");

  const skills = await getManagerSkillGapAnalysis(manager.companyId);

  return (
    <div className="p-8 space-y-8 pb-32 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#00324F] tracking-tighter uppercase">Roadmap de Skills</h1>
          <p className="text-slate-500 font-medium italic">Análise de Lacunas e Oportunidades de Crescimento</p>
        </div>
      </div>

      {/* 1. CARDS DE INSIGHTS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-red-50 rounded-[2rem] p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500 rounded-2xl text-white"><TrendingDown size={24} /></div>
            <h3 className="font-black text-red-900 text-sm uppercase">Pontos Críticos</h3>
          </div>
          <p className="text-3xl font-black text-red-600">
            {skills.filter((s:any) => s.priority === "ALTA").length} Skills
          </p>
          <p className="text-[10px] font-bold text-red-700 uppercase mt-2 tracking-widest">Abaixo de 40% de domínio</p>
        </Card>

        <Card className="border-none shadow-xl bg-emerald-50 rounded-[2rem] p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white"><ShieldCheck size={24} /></div>
            <h3 className="font-black text-emerald-900 text-sm uppercase">Domínios Consolidados</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {skills.filter((s:any) => s.current_level >= 75).length} Skills
          </p>
          <p className="text-[10px] font-bold text-emerald-700 uppercase mt-2 tracking-widest">Prontas para escala</p>
        </Card>

        <Card className="border-none shadow-xl bg-[#00324F] rounded-[2rem] p-6 text-white">
           <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#00324F]"><Zap size={24} /></div>
            <h3 className="font-black text-blue-100 text-sm uppercase">Próximo Treinamento</h3>
          </div>
          <p className="text-lg font-black leading-tight uppercase">
            {skills[0]?.skill_name || "Nenhum pendente"}
          </p>
          <p className="text-[10px] font-bold text-blue-300 uppercase mt-2 tracking-widest">Prioridade nº 1 sugerida pelo BI</p>
        </Card>
      </div>

      {/* 2. TABELA DE PRIORIZAÇÃO DE SKILLS */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 border-b bg-slate-50/50">
           <CardTitle className="text-lg font-black text-[#00324F] uppercase tracking-tighter flex items-center gap-2">
             <Target size={20} /> Matriz de Priorização Estratégica
           </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {skills.map((skill: any) => (
              <div key={skill.skill_name} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] bg-slate-50/50 border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                <div className="w-full md:w-1/3">
                  <p className="font-black text-[#00324F] uppercase group-hover:text-blue-600 transition-colors">{skill.skill_name}</p>
                  <Badge className={`mt-2 border-none text-[8px] font-black tracking-[0.2em] ${
                    skill.priority === 'ALTA' ? 'bg-red-100 text-red-600' : 
                    skill.priority === 'MÉDIA' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    PRIORIDADE {skill.priority}
                  </Badge>
                </div>

                <div className="w-full md:w-1/3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>Proficiência Atual</span>
                    <span>{skill.current_level}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        skill.current_level < 40 ? 'bg-red-500' : skill.current_level < 70 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${skill.current_level}%` }} 
                    />
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex justify-end items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Skill Gap</p>
                    <p className="text-xl font-black text-[#00324F]">-{Math.round(skill.gap)}%</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer">
                    <Lightbulb size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}