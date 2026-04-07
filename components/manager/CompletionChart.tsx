// components/manager/CompletionChart.tsx
"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CompletionChart({ data }) {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 mb-4">Conclusão de Aulas (Últimos 30 dias)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="completions" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563eb' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}