// components/manager/QuizPerformance.tsx
"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function QuizPerformance({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico de Barras: Live vs Gravado */}
      <Card className="lg:col-span-2 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase text-slate-500">
            Proficiência: Ao Vivo vs. Gravado
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend />
              <Bar name="Após Live" dataKey="live_score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Apenas Gravado" dataKey="recorded_score" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights Técnicos */}
      <Card className="border-none shadow-md bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Diagnóstico de Retenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              {item.avg_score < 60 ? (
                <AlertTriangle className="text-orange-400 mt-1" size={18} />
              ) : (
                <CheckCircle className="text-green-400 mt-1" size={18} />
              )}
              <div>
                <p className="text-xs font-bold uppercase">{item.category}</p>
                <p className="text-lg font-black">{Math.round(item.avg_score)}%</p>
                <p className="text-[10px] opacity-60">
                  {item.avg_score < 60 ? "Necessita reforço técnico" : "Domínio dentro do esperado"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}