"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { 
  getAllUsers, 
  getCompanies, 
  linkStudentToCompany, 
  updateUserDepartment,
  deleteCompanyAction 
} from "@/lib/auth-actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Search, 
  Users, 
  Trash2, 
  Briefcase, 
  CheckCircle2, 
  Loader2,
  UserCircle,
  AlertTriangle
} from "lucide-react"

export default function GestaoEmpresaAlunosPage() {
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadData = async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const [resUsers, resComp] = await Promise.all([
        getAllUsers(user.email),
        getCompanies()
      ])
      // Garante que users sempre seja um array, mesmo se o banco falhar
      setUsers(Array.isArray(resUsers.users) ? resUsers.users : [])
      setCompanies(Array.isArray(resComp.companies) ? resComp.companies : [])
    } catch (err) {
      console.error("Erro crítico ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') loadData()
  }, [user, authLoading])

  // --- AÇÕES ---

  const handleLink = async (userId: number, companyId: number | null) => {
    setUpdatingId(userId)
    
    // ATUALIZAÇÃO OTIMISTA: Reflete na tela instantaneamente
    setUsers(prev => prev.map(u => 
      u?.id === userId ? { ...u, company_id: companyId } : u
    ))
    
    const res = await linkStudentToCompany(userId, companyId)
    if (!res.success) {
      alert("Erro ao salvar no banco. Revertendo...")
      loadData()
    }
    setUpdatingId(null)
  }

  const handleDeleteCompany = async (id: number) => {
    if (!confirm("⚠️ ATENÇÃO: Ao excluir esta empresa, todos os alunos vinculados a ela ficarão sem empresa. Deseja continuar?")) return
    const res = await deleteCompanyAction(id)
    if (res.success) loadData()
    else alert("Não foi possível excluir. Verifique se há restrições no banco.")
  }

  // FILTRO SEGURO: Lida com nomes nulos ou undefined
  const filteredUsers = users.filter(u => {
    if (!u) return false
    const firstName = u.first_name || ""
    const lastName = u.last_name || ""
    const email = u.email || ""
    const search = searchTerm.toLowerCase()
    
    return (
      firstName.toLowerCase().includes(search) || 
      lastName.toLowerCase().includes(search) || 
      email.toLowerCase().includes(search)
    )
  })

  if (loading && users.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 gap-3">
      <Loader2 className="animate-spin text-[#00324F] w-8 h-8" />
      <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Sincronizando Master Project...</span>
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen pb-24 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Badge className="bg-[#00324F] text-white hover:bg-[#00324F] mb-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest shadow-lg shadow-blue-900/20">
            PAINEL OPERACIONAL B2B
          </Badge>
          <h1 className="text-4xl font-black text-[#00324F] tracking-tighter">Vínculos & Portfólio</h1>
          <p className="text-slate-500 font-medium max-w-md">Gerencie a alocação do seu time de alunos e remova contratos inativos.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <Input 
            placeholder="Buscar por nome ou e-mail..." 
            className="pl-12 h-14 rounded-2xl shadow-xl border-none bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* SEÇÃO 1: GESTÃO DE EMPRESAS (EXCLUSÃO) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            <h2 className="text-xs font-black text-[#00324F] uppercase tracking-widest">Empresas Ativas</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-tighter italic">* Clique na lixeira para encerrar um contrato</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map(c => (
            <Card key={c?.id} className="border-none shadow-sm bg-white hover:shadow-xl transition-all group rounded-2xl overflow-hidden border-b-4 border-b-transparent hover:border-b-red-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-red-50 transition-colors">
                    <Building2 size={18} className="text-slate-400 group-hover:text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#00324F] uppercase truncate max-w-[120px]">{c?.name || "Sem Nome"}</p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {users.filter(u => String(u?.company_id) === String(c?.id)).length} Alunos
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-200 hover:text-red-600 hover:bg-red-100/50 rounded-full transition-all"
                  onClick={() => handleDeleteCompany(c?.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
          {companies.length === 0 && (
             <div className="col-span-full py-6 text-center border-2 border-dashed rounded-2xl text-slate-300 font-bold text-xs uppercase">
               Nenhuma empresa cadastrada no sistema.
             </div>
          )}
        </div>
      </section>

      {/* SEÇÃO 2: TABELA DE VÍNCULOS (ALUNOS) */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#00324F]">
            <TableRow className="hover:bg-[#00324F] border-none">
              <TableHead className="text-white font-bold h-16 pl-8">IDENTIFICAÇÃO</TableHead>
              <TableHead className="text-white font-bold h-16">EMPRESA CLIENTE</TableHead>
              <TableHead className="text-white font-bold h-16 pr-8">DEPARTAMENTO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u?.id} className="hover:bg-blue-50/40 transition-colors border-slate-50 h-20">
                <TableCell className="pl-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#00324F] font-black text-sm shadow-inner overflow-hidden">
                      {/* BLINDAGEM CONTRA O ERRO '0': Uso de optional chaining e fallback */}
                      {u?.first_name ? String(u.first_name).charAt(0).toUpperCase() : <UserCircle className="text-slate-300" />}
                    </div>
                    <div>
                      <p className="font-black text-[#00324F] text-sm uppercase leading-tight">
                        {u?.first_name || "Usuário"} {u?.last_name || ""}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-tight">{u?.email || "Sem e-mail"}</p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="relative max-w-[240px]">
                    <select 
                      disabled={updatingId === u?.id}
                      className={`w-full p-3 border-2 rounded-2xl text-[11px] font-black outline-none transition-all appearance-none cursor-pointer uppercase ${
                        u?.company_id ? 'border-blue-100 bg-blue-50/50 text-blue-700' : 'border-slate-100 bg-white text-slate-300'
                      }`}
                      value={u?.company_id || ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value)
                        handleLink(u?.id, val)
                      }}
                    >
                      <option value="">🚫 SEM EMPRESA (ALUNO AVULSO)</option>
                      {companies.map(c => (
                        <option key={c?.id} value={c?.id}>🏢 {String(c?.name).toUpperCase()}</option>
                      ))}
                    </select>
                    {updatingId === u?.id && (
                      <Loader2 className="absolute right-4 top-3.5 w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </TableCell>

                <TableCell className="pr-8">
                  <div className="flex items-center gap-3 group">
                    <div className="relative flex-1 max-w-[220px]">
                      <Briefcase className="absolute left-4 top-3 text-slate-300 group-hover:text-blue-500 transition-colors" size={16} />
                      <Input 
                        placeholder="Ex: Recursos Humanos" 
                        className="h-12 pl-11 text-[11px] font-bold border-2 border-slate-100 rounded-2xl focus:border-blue-400 bg-slate-50/30 transition-all placeholder:text-slate-200"
                        defaultValue={u?.department || ""}
                        onBlur={async (e) => {
                          const val = e.target.value
                          await updateUserDepartment(u?.id, val)
                        }}
                      />
                    </div>
                    {u?.department && (
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <CheckCircle2 size={16} className="text-green-600 animate-in zoom-in duration-300" />
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUsers.length === 0 && (
          <div className="p-32 text-center space-y-4">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-slate-200 w-10 h-10" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhum registro encontrado.</p>
          </div>
        )}
      </Card>
    </div>
  )
}