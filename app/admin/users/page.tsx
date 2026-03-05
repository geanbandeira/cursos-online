"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllUsers } from "@/lib/auth-actions"
import { getUserCertificatesAction } from "@/lib/course-actions"
import { getAllCoursesAction, enrollUserInCourseAction } from "@/lib/course-actions"
// IMPORTANTE: Adicione o Badge e a função de certificados (se ela existir no seu lib)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, UserPlus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Search, Award, Eye } from "lucide-react"
import { Clock, Filter, GraduationCap, FileCheck } from "lucide-react"
export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollData, setEnrollData] = useState({ userId: "", courseId: "" })
  const [enrollMessage, setEnrollMessage] = useState({ type: "", text: "" })
  const [selectedCerts, setSelectedCerts] = useState<any[] | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({ total: 0, waitingCert: 0, studying: 0 })

  const fetchData = async () => {
    if (!user?.email) return
    setLoading(true)
    const resUsers = await getAllUsers(user.email)
    const resCourses = await getAllCoursesAction()

    if (resUsers.success) {
      setUsers(resUsers.users)
      // Calcula as estatísticas
      const total = resUsers.users.length
      const waitingCert = resUsers.users.filter((u: any) => u.enrollments?.some((e: any) => e.progress === 100)).length
      const studying = resUsers.users.filter((u: any) => u.enrollments?.some((e: any) => e.progress > 0 && e.progress < 100)).length
      setStats({ total, waitingCert, studying })
    }
    if (resCourses.success) setCourses(resCourses.courses)
    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') fetchData()
  }, [user, authLoading])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrollMessage({ type: "info", text: "Processando..." })
    const res = await enrollUserInCourseAction(Number(enrollData.userId), Number(enrollData.courseId))
    if (res.success) {
      setEnrollMessage({ type: "success", text: "Matrícula realizada com sucesso!" })
      setTimeout(() => { setShowEnrollModal(false); setEnrollMessage({ type: "", text: "" }) }, 2000)
    } else {
      setEnrollMessage({ type: "error", text: res.error })
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    const enrolls = u.enrollments || []
    const hasCompleted = enrolls.some((e: any) => e.progress === 100)
    const hasStarted = enrolls.some((e: any) => e.progress > 0)

    if (statusFilter === "completed") return hasCompleted
    if (statusFilter === "in_progress") return hasStarted && !hasCompleted
    if (statusFilter === "not_started") return !hasStarted || enrolls.length === 0

    return true
  })

  // 2. Atualize a função handleViewCerts dentro do seu componente
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

  if (authLoading || user?.role !== 'admin') return <div className="p-8 text-center">Verificando permissões...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#00324F]">Gestão de Usuários</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2" /> Atualizar</Button>
          {/* BOTÃO DA CENTRAL DE CERTIFICADOS - ADICIONE ESTE AQUI */}
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = '/admin/users/certificates'}
          >
            <FileCheck className="w-4 h-4 mr-2" /> Central de Certificados
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowEnrollModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Matricular em Curso
          </Button>
        </div>
      </div>

      {/* 2. CAMPO DE BUSCA (É AQUI QUE VOCÊ COLOCA) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          className="pl-10"
          value={searchTerm} // Lembre-se de definir o state searchTerm no topo do componente
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ADICIONE OS CARDS DE RESUMO AQUI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Total Alunos</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <Clock className="text-blue-200 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Estudando</p><p className="text-2xl font-bold">{stats.studying}</p></div>
            <Filter className="text-orange-200 w-8 h-8" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 bg-green-50/30">
          <CardContent className="pt-4 flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Pronto para Certificado</p><p className="text-2xl font-bold">{stats.waitingCert}</p></div>
            <GraduationCap className="text-green-200 w-10 h-10" />
          </CardContent>
        </Card>
      </div>


      {/* ADICIONE OS BOTÕES DE FILTRO LOGO ABAIXO DA BUSCA */}
      <div className="flex gap-2 mb-6">
        <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} size="sm">Todos</Button>
        <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} onClick={() => setStatusFilter('completed')} size="sm" className="text-green-600">Concluídos (100%)</Button>
        <Button variant={statusFilter === 'in_progress' ? 'default' : 'outline'} onClick={() => setStatusFilter('in_progress')} size="sm" className="text-blue-600">Em Andamento</Button>
      </div>

      {/* 3. CARD COM A TABELA */}
      <Card>
        <CardHeader><CardTitle>Usuários no Sistema</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Cursos & Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Aqui você usa o 'filteredUsers' que calculamos antes */}
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-bold text-[#00324F]">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Desde: {new Date(u.created_at).toLocaleDateString()}</div>
                  </TableCell>

                  <TableCell className="min-w-[250px]">
                    <div className="space-y-3">
                      {u.enrollments && u.enrollments.length > 0 ? (
                        u.enrollments.map((en: any) => (
                          <div key={en.course_id} className="group">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-medium truncate max-w-[150px]">{en.title}</span>
                              <span className={`font-bold ${en.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                {en.progress}%
                              </span>
                            </div>
                            {/* Barra de progresso dinâmica */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${en.progress === 100 ? 'bg-green-500' : 'bg-[#00324F]'}`}
                                style={{ width: `${en.progress}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs italic text-gray-400">Nenhum curso iniciado</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full max-w-[140px] text-xs h-8"
                        onClick={() => handleViewCerts(u.id)}
                        disabled={!u.enrollments?.some((e: any) => e.progress === 100)}
                      >
                        <Award className="w-3.5 h-3.5 mr-2" /> Certificados
                      </Button>

                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                        {u.role}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>



      {/* MODAL DE CERTIFICADOS */}
      {selectedCerts && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-96 p-4">
            <h2 className="font-bold mb-4">Certificados do Aluno</h2>
            {selectedCerts.map((c, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{c.title}</span>
                <Badge>{c.certificate_code}</Badge>
              </div>
            ))}
            <Button className="w-full mt-4" onClick={() => setSelectedCerts(null)}>Fechar</Button>
          </Card>
        </div>
      )}

      {/* MODAL DE MATRÍCULA (mantido igual ao seu, mas com correções de estrutura) */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md relative">
            <button onClick={() => setShowEnrollModal(false)} className="absolute right-4 top-4"><X className="w-5 h-5" /></button>
            <CardHeader><CardTitle>Nova Matrícula</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecionar Aluno</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    required
                    onChange={(e) => setEnrollData({ ...enrollData, userId: e.target.value })}
                  >
                    <option value="">Selecione um aluno...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} ({u.email})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Selecionar Curso</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    required
                    onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value })}
                  >
                    <option value="">Selecione um curso...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                {enrollMessage.text && (
                  <p className={`text-sm ${enrollMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {enrollMessage.text}
                  </p>
                )}
                <Button type="submit" className="w-full bg-[#00324F]">Confirmar Matrícula</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}