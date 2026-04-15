import React from "react"
import { redirect } from "next/navigation"
import { getCurrentManager } from "@/lib/auth-actions"
import { getManagerTeamDetailedStats } from "@/lib/course-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, MessageSquare, AlertCircle, 
  TrendingUp, Calendar, Zap, ArrowRight 
} from "lucide-react"

export default async function TeamIntelligencePage() {
  const manager = await getCurrentManager();
  if (!manager || !manager.companyId) redirect("/auth/login");

  const team = await getManagerTeamDetailedStats(manager.companyId);

  return (
    <div className="p-8 space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#00324F] tracking-tighter uppercase">Inteligência de Time</h1>
          <p className="text-slate-500 font-medium italic">Gestão Preditiva de Performance</p>
        </div>
        <div className="flex gap-2">
           <Badge className="bg-orange-100 text-orange-600 border-none px-4 py-2 rounded-xl font-black">
             {team.filter((u:any) => u.days_inactive > 7).length} ALERTAS DE EVASÃO
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 font-black text-[10px] uppercase text-[#00324F] tracking-widest">Colaborador</th>
                  <th className="p-6 font-black text-[10px] uppercase text-[#00324F] tracking-widest">Status Atual</th>
                  <th className="p-6 font-black text-[10px] uppercase text-[#00324F] tracking-widest">Progresso Médio</th>
                  <th className="p-6 font-black text-[10px] uppercase text-[#00324F] tracking-widest">Previsão Conclusão</th>
                  <th className="p-6 text-right font-black text-[10px] uppercase text-[#00324F] tracking-widest">Ação 2026</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member: any) => (
                  <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-[#00324F] group-hover:text-blue-600 transition-colors uppercase">{member.first_name} {member.last_name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{member.department || "GERAL"}</div>
                    </td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 font-black text-[10px] uppercase ${member.statusColor}`}>
                        <AlertCircle size={14} /> {member.status}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">Inativo há {member.days_inactive} dias</div>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                         <span className="font-black text-[#00324F] text-lg">{Math.round(member.avg_progress)}%</span>
                         <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${member.avg_progress}%` }} />
                         </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
                        <Calendar size={14} className="text-slate-300" /> {member.estimatedDays}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="bg-[#00324F] text-white p-3 rounded-2xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20">
                        <MessageSquare size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}