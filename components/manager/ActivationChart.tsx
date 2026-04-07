"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ActivationChart({ data }) {
  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c'];

  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 mb-4">Ativação por Departamento (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="department" type="category" width={100} fontSize={12} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="activationRate" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// components/manager/QuizAnalytics.tsx
export function QuizAnalytics({ quizData }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-bold text-slate-800 mb-2">Proficiência por Tema</h3>
      <p className="text-sm text-slate-500 mb-6 text-balance">
        Identificamos que o time de <strong>Vendas</strong> tem 40% de erro em "Negociação Avançada". 
        Sugerimos reforçar o Módulo 3.
      </p>
      
      {/* Visual de Barras de Progresso de Notas */}
      <div className="space-y-4">
        {quizData.map((item) => (
          <div key={item.topic}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{item.topic}</span>
              <span className={item.avgScore > 70 ? "text-green-600" : "text-red-500"}>
                {item.avgScore}% de acerto
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.avgScore > 70 ? "bg-green-500" : "bg-amber-500"}`} 
                style={{ width: `${item.avgScore}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}