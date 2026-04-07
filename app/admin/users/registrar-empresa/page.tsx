"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { createCompanyWithManagers } from "@/lib/auth-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, ShieldCheck, Rocket, Loader2, CheckCircle2 } from "lucide-react"

export default function RegistrarEmpresaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [managers, setManagers] = useState([
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" }
  ])

  const handleManagerChange = (index: number, field: string, value: string) => {
    const newManagers = [...managers]
    newManagers[index] = { ...newManagers[index], [field]: value }
    setManagers(newManagers)
  }


const handleOnboarding = async () => {
  if (!companyName.trim()) return alert("Nome da empresa é obrigatório.");
  
  // FILTRO: Só envia gestores que tenham pelo menos o e-mail preenchido
  const validManagers = managers.filter(m => m.email.trim() !== "");
  
  if (validManagers.length === 0) {
    return alert("Adicione pelo menos um gestor com e-mail válido.");
  }

  setLoading(true);
  
  const res = await createCompanyWithManagers(companyName, validManagers);
  
  if (res.success) {
    alert("Onboarding concluído com sucesso!");
    router.push("/admin/users/empresa");
  } else {
    // Agora o erro virá detalhado se algo falhar no SQL
    alert("Erro no onboarding: " + res.error);
  }
  setLoading(false);
}

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="space-y-2">
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Configuração B2B</Badge>
        <h1 className="text-4xl font-black text-[#00324F] tracking-tighter">Onboarding Empresas</h1>
        <p className="text-slate-500 font-medium italic">Acesso restrito ao Administrador Master</p>
      </header>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-[#00324F] text-white p-8">
          <div className="flex items-center gap-4">
            <Building2 size={32} className="text-blue-400" />
            <div>
              <CardTitle className="text-2xl font-bold uppercase">Identidade da Empresa</CardTitle>
              <CardDescription className="text-blue-200">Defina o nome jurídico ou fantasia da conta cliente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <Label className="font-black text-slate-700">NOME DA EMPRESA</Label>
            <Input 
              placeholder="Ex: Master Project Ltda" 
              className="h-14 text-lg border-2 focus:ring-blue-500 rounded-2xl" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="text-blue-600" size={20} />
              <h2 className="font-black text-[#00324F] uppercase tracking-widest text-sm">Configurar Liderança (3 Slots)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {managers.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 space-y-4">
                  <Badge variant="outline" className="bg-white">Gestor 0{i + 1}</Badge>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Nome" 
                      className="h-10 bg-white" 
                      value={m.name}
                      onChange={(e) => handleManagerChange(i, "name", e.target.value)}
                    />
                    <Input 
                      placeholder="E-mail" 
                      className="h-10 bg-white" 
                      value={m.email}
                      onChange={(e) => handleManagerChange(i, "email", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            disabled={loading}
            onClick={handleOnboarding}
            className="w-full h-16 bg-[#00324F] hover:bg-blue-900 rounded-2xl text-xl font-black shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Rocket className="mr-3" /> CONFIRMAR ONBOARDING</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}