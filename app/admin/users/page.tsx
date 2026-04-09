"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
// IMPORT CORRIGIDO: Funções de usuário ficam em auth-actions
import { getAllUsers } from "@/lib/auth-actions"
// IMPORT CORRIGIDO: Funções de cursos e matrículas ficam em course-actions
import {
  getAllCoursesAction,
  enrollUserInCourseAction,
  getUserCertificatesAction
} from "@/lib/course-actions"

import { RoleGuard } from "@/components/auth/RoleGuard"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  RefreshCw, UserPlus, X, Search, Award, FileCheck,
  Clock, Filter, GraduationCap, Calendar, LogIn, Users
} from "lucide-react"

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  // Estado da Matrícula
  const [enrollData, setEnrollData] = useState({ userId: "", courseId: "" })
  const [enrollMessage, setEnrollMessage] = useState({ type: "", text: "" })

  const [selectedCerts, setSelectedCerts] = useState<any[] | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({ total: 0, waitingCert: 0, studying: 0 })

  // Formatador de Data
  const formatDate = (dateString: string) => {
    if (!dateString) return "Nunca"
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString))
  }
  const handleViewCerts = async (userId: number) => {
    setLoading(true);
    const res = await getUserCertificatesAction(userId);
    if (res.success && res.certificates.length > 0) {
      setSelectedCerts(res.certificates);
    } else {
      alert("Este aluno ainda não possui certificados gerados.");
    }
    setLoading(false);
  };

  const fetchData = async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const [resUsers, resCourses] = await Promise.all([
        getAllUsers(user.email),
        getAllCoursesAction()
      ])
      if (resUsers.success) {
        setUsers(resUsers.users)
        setStats({
          total: resUsers.users.length,
          waitingCert: resUsers.users.filter((u: any) => u.enrollments?.some((e: any) => e.progress === 100)).length,
          studying: resUsers.users.filter((u: any) => u.enrollments?.some((e: any) => e.progress > 0 && e.progress < 100)).length
        })
      }
      if (resCourses.success) setCourses(resCourses.courses)
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') fetchData()
  }, [user, authLoading])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollData.userId || !enrollData.courseId) {
      setEnrollMessage({ type: "error", text: "Selecione o aluno e o curso." })
      return
    }
    setEnrollMessage({ type: "info", text: "Processando..." })

    // Agora chamando a função do arquivo certo (course-actions)
    const res = await enrollUserInCourseAction(Number(enrollData.userId), Number(enrollData.courseId))

    if (res.success) {
      setEnrollMessage({ type: "success", text: "Matrícula realizada com sucesso!" })
      fetchData()
      setTimeout(() => {
        setShowEnrollModal(false)
        setEnrollMessage({ type: "", text: "" })
        setEnrollData({ userId: "", courseId: "" })
      }, 2000)
    } else {
      setEnrollMessage({ type: "error", text: res.error || "Erro ao matricular." })
    }
  }



  const filteredUsers = users.filter(u => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase()
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || fullName.includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === "manager") return u.role === "manager"
    if (statusFilter === "all") return true
    const enrolls = u.enrollments || []
    if (statusFilter === "completed") return enrolls.some((e: any) => e.progress === 100)
    if (statusFilter === "in_progress") return enrolls.some((e: any) => e.progress > 0 && e.progress < 100)
    return true
  })

  if (authLoading) return <div className="p-8 text-center">Carregando...</div>

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="p-8 space-y-6 bg-slate-50 min-h-screen">

        {/* 1. HEADER E AÇÕES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-black text-[#00324F] tracking-tighter uppercase">Gestão Master de Usuários</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchData} className="rounded-xl border-slate-200">
              <RefreshCw className="w-4 h-4 mr-2" /> Atualizar Dados
            </Button>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold"
              onClick={() => window.location.href = '/admin/users/certificates'}
            >
              <FileCheck className="w-4 h-4 mr-2" /> Central de Diplomas
            </Button>
            <Button className="bg-[#00324F] hover:bg-blue-900 rounded-xl font-bold px-6" onClick={() => setShowEnrollModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Matricular Aluno
            </Button>
          </div>
        </div>

        {/* 2. CARDS DE RESUMO (STATS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Total de Alunos</p>
                <p className="text-3xl font-black text-[#00324F] tracking-tighter">{stats.total}</p>
              </div>
              <Users className="text-blue-100 group-hover:text-blue-500 transition-colors w-12 h-12" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Estudando Agora</p>
                <p className="text-3xl font-black text-[#00324F] tracking-tighter">{stats.studying}</p>
              </div>
              <Clock className="text-orange-100 group-hover:text-orange-500 transition-colors w-12 h-12" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Conclusões Pendentes</p>
                <p className="text-3xl font-black text-[#00324F] tracking-tighter">{stats.waitingCert}</p>
              </div>
              <GraduationCap className="text-green-100 group-hover:text-green-500 transition-colors w-12 h-12" />
            </CardContent>
          </Card>
        </div>

        {/* 3. PESQUISA E FILTROS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar nome ou e-mail..."
              className="pl-12 h-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 focus:ring-2 focus:ring-blue-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'completed', label: 'Concluídos', color: 'text-green-600' },
              { id: 'in_progress', label: 'Em Andamento', color: 'text-blue-600' },
              { id: 'manager', label: 'Gestores' }
            ].map((btn) => (
              <Button
                key={btn.id}
                variant={statusFilter === btn.id ? 'default' : 'outline'}
                onClick={() => setStatusFilter(btn.id)}
                size="sm"
                className={`rounded-full px-6 font-black uppercase text-[10px] tracking-widest ${statusFilter !== btn.id ? btn.color : ''}`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 4. TABELA PRINCIPAL */}
        <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
              <TableRow>
                <TableHead className="font-black text-[#00324F] h-16 px-8 uppercase text-[10px] tracking-widest">Identificação & Acesso</TableHead>
                <TableHead className="font-black text-[#00324F] h-16 uppercase text-[10px] tracking-widest">Progresso nos Treinamentos</TableHead>
                <TableHead className="text-right font-black text-[#00324F] h-16 px-8 uppercase text-[10px] tracking-widest">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="font-black text-xl text-[#00324F] group-hover:text-blue-600 transition-colors tracking-tighter leading-none">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-xs font-bold text-slate-400 lowercase mb-3">{u.email}</div>

                      {/* NOVAS DATAS DE ACESSO */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar size={12} className="text-blue-400" />
                          Cadastro: <span className="text-slate-600">{formatDate(u.created_at).split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <LogIn size={12} className="text-emerald-400" />
                          Acesso: <span className="text-slate-600">{formatDate(u.last_login || u.updated_at)}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className={`mt-4 w-fit text-[9px] px-3 py-0.5 rounded-full uppercase font-black border-2 ${u.role === 'manager' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                        {u.role === 'manager' ? 'Gestor Master' : 'Estudante'}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[320px]">
                    <div className="space-y-4">
                      {u.enrollments && u.enrollments.length > 0 ? (
                        u.enrollments.map((en: any) => (
                          <div key={en.course_id}>
                            <div className="flex justify-between mb-1.5 uppercase font-black text-[9px] tracking-widest">
                              <span className="truncate max-w-[200px] text-[#00324F]">{en.title}</span>
                              <span className={en.progress === 100 ? 'text-emerald-500' : 'text-blue-600'}>{en.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                              <div
                                className={`h-full transition-all duration-1000 ${en.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                                style={{ width: `${en.progress}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 italic uppercase">
                          <Filter size={12} /> Sem matrículas ativas
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right px-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-10 px-6 rounded-2xl border-2 border-slate-100 text-[#00324F] font-black hover:bg-[#00324F] hover:text-white transition-all shadow-sm"
                      onClick={() => handleViewCerts(u.id)}
                      disabled={!u.enrollments?.some((e: any) => e.progress === 100)}
                    >
                      <Award className="w-4 h-4 mr-2" /> Certificados
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* MODAL DE CERTIFICADOS */}
{selectedCerts && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <Card className="w-full max-w-sm p-8 relative shadow-2xl rounded-[2.5rem] border-none bg-white">
      <button 
        onClick={() => setSelectedCerts(null)} 
        className="absolute right-8 top-8 text-slate-300 hover:text-red-500 transition-colors"
      >
        <X size={24} />
      </button>
      
      <h2 className="font-black text-2xl mb-6 text-[#00324F] uppercase tracking-tighter">Diplomas</h2>
      
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {selectedCerts.map((c, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
            <span className="font-black text-sm text-[#00324F] uppercase tracking-tight leading-tight">
              {c.title}
            </span>
            <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-mono w-fit mt-1">
              {c.certificate_code}
            </Badge>
          </div>
        ))}
      </div>
      
      <Button 
        className="w-full mt-8 bg-[#00324F] h-14 rounded-2xl font-black text-white shadow-xl" 
        onClick={() => setSelectedCerts(null)}
      >
        Fechar Visualização
      </Button>
    </Card>
  </div>
)}

        {/* 6. MODAL DE MATRÍCULA (FIX DEFINITIVO) */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-md relative shadow-2xl rounded-[3rem] border-none bg-white overflow-hidden">
              <button onClick={() => setShowEnrollModal(false)} className="absolute right-8 top-8 z-10 text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
              <CardHeader className="pt-10 pb-4 px-10"><CardTitle className="text-3xl font-black text-[#00324F] uppercase tracking-tighter leading-none">Matricular Aluno</CardTitle></CardHeader>
              <CardContent className="px-10 pb-10">
                <form onSubmit={handleEnroll} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-slate-400 ml-2">Escolha o Estudante</Label>
                    <select
                      className="w-full h-14 px-5 border-2 border-slate-50 rounded-[1.5rem] text-sm bg-slate-50 font-bold focus:border-blue-500 transition-all outline-none appearance-none"
                      required
                      value={enrollData.userId}
                      onChange={(e) => setEnrollData({ ...enrollData, userId: e.target.value })}
                    >
                      <option value="">Selecione o aluno...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase text-slate-400 ml-2">Escolha o Treinamento</Label>
                    <select
                      className="w-full h-14 px-5 border-2 border-slate-50 rounded-[1.5rem] text-sm bg-slate-50 font-bold focus:border-blue-500 transition-all outline-none appearance-none"
                      required
                      value={enrollData.courseId}
                      onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value })}
                    >
                      <option value="">Selecione o treinamento...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  {enrollMessage.text && (
                    <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest ${enrollMessage.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                      {enrollMessage.text}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-[#00324F] h-16 text-lg font-black rounded-[1.5rem] hover:bg-blue-900 shadow-2xl transition-all mt-4">
                    FINALIZAR MATRÍCULA
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}