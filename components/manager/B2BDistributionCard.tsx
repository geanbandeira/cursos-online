"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

export function B2BDistributionCard({ packages }: { packages: any[] }) {
  const [distEmail, setDistEmail] = useState("");
  const [distPackageId, setDistPackageId] = useState("");
  const [distLoading, setDistLoading] = useState(false);
  const router = useRouter();

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistLoading(true);
    try {
      const res = await fetch("/api/empresa/distribuir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: distEmail, packageId: distPackageId }),
      });
      
      if (res.ok) {
        alert("✅ Acesso liberado com sucesso!");
        setDistEmail("");
        router.refresh(); // Recarrega os dados da página pai automaticamente para atualizar as vagas
      } else {
        const errText = await res.text();
        alert("❌ Erro: " + errText);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao distribuir acesso.");
    } finally {
      setDistLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-50 text-green-600 rounded-xl">
            <Send size={20} />
          </div>
          <h2 className="font-black text-[#00324F] uppercase tracking-widest text-sm">
            Distribuir Acesso de Curso
          </h2>
        </div>
        
        <form onSubmit={handleDistribute} className="flex flex-col md:flex-row gap-4">
          <select 
            required
            value={distPackageId}
            onChange={(e) => setDistPackageId(e.target.value)}
            className="flex-1 h-14 px-4 border-2 border-slate-100 rounded-2xl font-bold uppercase text-slate-600 outline-none focus:border-blue-400 text-xs bg-slate-50/50"
          >
            <option value="">Selecione o Pacote de Vagas</option>
            {packages.map(p => {
              const vagasRestantes = p.totalSeats - p.usedSeats;
              return (
                <option key={p.id} value={p.id} disabled={vagasRestantes <= 0}>
                  Curso ID: {p.courseId} - Restam {vagasRestantes} vagas
                </option>
              );
            })}
          </select>

          <Input 
            required 
            type="email" 
            placeholder="E-mail do Aluno" 
            value={distEmail}
            onChange={(e) => setDistEmail(e.target.value)}
            className="flex-1 h-14 border-2 border-slate-100 rounded-2xl font-bold bg-slate-50/50"
          />
          
          <Button 
            type="submit" 
            disabled={distLoading} 
            className="h-14 px-8 bg-green-600 hover:bg-green-700 font-bold rounded-2xl text-white shadow-lg shadow-green-600/20 transition-all"
          >
            {distLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Liberar Acesso"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}