"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getAllUsers,
  getCompanies,
  linkStudentToCompany,
  updateUserDepartment
} from "@/lib/auth-actions"
import {
  getAllCoursesAction,
  enrollUserInCourseAction,
  getUserCertificatesAction
} from "@/lib/course-actions"

import { RoleGuard } from "@/components/auth/RoleGuard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  UserPlus,
  X,
  Search,
  Award,
  FileCheck,
  Clock,
  Filter,
  GraduationCap
} from "lucide-react"

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [allCompanies, setAllCompanies] = useState<any[]>([])
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

    const [resUsers, resCourses, resCompanies] = await Promise.all([
      getAllUsers(user.email),
      getAllCoursesAction(),
      getCompanies()
    ])

    if (resUsers.success) {
      setUsers(resUsers.users)

      const total = resUsers.users.length
      const waitingCert = resUsers.users.filter((u: any) =>
        u.enrollments?.some((e: any) => e.progress === 100)
      ).length
      const studying = resUsers.users.filter((u: any) =>
        u.enrollments?.some((e: any) => e.progress > 0 && e.progress < 100)
      ).length

      setStats({ total, waitingCert, studying })
    }

    if (resCourses.success) setCourses(resCourses.courses)
    if (resCompanies.success) setAllCompanies(resCompanies.companies)

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
      fetchData()
      setTimeout(() => { setShowEnrollModal(false); setEnrollMessage({ type: "", text: "" }) }, 2000)
    } else {
      setEnrollMessage({ type: "error", text: res.error })
    }
  }

  const handleViewCerts = async (userId: number) => {
    setLoading(true);
    const res = await getUserCertificatesAction(userId);
    if (res.success && res.certificates.length > 0) {
      setSelectedCerts(res.certificates);
    } else {
      alert("Este aluno ainda não possui certificados.");
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === "manager") return u.role === "manager"
    if (statusFilter === "all") return true

    const enrolls = u.enrollments || []
    const hasCompleted = enrolls.some((e: any) => e.progress === 100)
    const hasStarted = enrolls.some((e: any) => e.progress > 0)

    if (statusFilter === "completed") return hasCompleted
    if (statusFilter === "in_progress") return hasStarted && !hasCompleted
    if (statusFilter === "not_started") return !hasStarted || enrolls.length === 0

    return true
  })

  if (authLoading || user?.role !== 'admin') return <div className="p-8 text-center">Verificando...</div>

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-[#00324F]">Gestão de Usuários Master</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2" /> Atualizar</Button>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/admin/users/certificates'}
            >
              <FileCheck className="w-4 h-4 mr-2" /> Central de Certificados
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowEnrollModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Matricular Aluno
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-4 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 font-bold uppercase">Total Alunos</p><p className="text-2xl font-black">{stats.total}</p></div>
              <Clock className="text-blue-200 w-8 h-8" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="pt-4 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 font-bold uppercase">Estudando</p><p className="text-2xl font-black">{stats.studying}</p></div>
              <Filter className="text-orange-200 w-8 h-8" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 bg-green-50/30 shadow-sm">
            <CardContent className="pt-4 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 font-bold uppercase tracking-tighter">Pronto para Certificado</p><p className="text-2xl font-black">{stats.waitingCert}</p></div>
              <GraduationCap className="text-green-200 w-10 h-10" />
            </CardContent>
          </Card>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} size="sm">Todos</Button>
            <Button variant={statusFilter === 'completed' ? 'default' : 'outline'} onClick={() => setStatusFilter('completed')} size="sm" className="text-green-600">Concluídos</Button>
            <Button variant={statusFilter === 'in_progress' ? 'default' : 'outline'} onClick={() => setStatusFilter('in_progress')} size="sm" className="text-blue-600">Em Andamento</Button>
          </div>
        </div>

        {/* TABLE */}
        <Card className="shadow-xl border-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="font-bold text-[#00324F]">Aluno</TableHead>
                <TableHead className="font-bold text-[#00324F]">Departamento</TableHead>
                <TableHead className="font-bold text-[#00324F]">Progresso Cursos</TableHead>
                <TableHead className="font-bold text-[#00324F]">Empresa Cliente</TableHead>
                <TableHead className="text-right font-bold text-[#00324F]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-[#00324F]">{u.first_name} {u.last_name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <Badge variant="outline" className={`mt-1 text-[9px] uppercase font-bold ${u.role === 'manager' ? 'border-blue-500 text-blue-600' : ''}`}>
                      {u.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Input
                      className="h-8 text-xs w-32 border-slate-200"
                      placeholder="TI, Vendas..."
                      defaultValue={u.department || ""}
                      onBlur={async (e) => {
                        await updateUserDepartment(u.id, e.target.value);
                      }}
                    />
                  </TableCell>

                  <TableCell className="min-w-[200px]">
                    <div className="space-y-2">
                      {u.enrollments?.length > 0 ? (
                        u.enrollments.map((en: any) => (
                          <div key={en.course_id} className="text-[10px]">
                            <div className="flex justify-between mb-1 uppercase font-bold">
                              <span className="truncate max-w-[120px]">{en.title}</span>
                              <span className={en.progress === 100 ? 'text-green-600' : 'text-blue-600'}>{en.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${en.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${en.progress}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : <span className="text-[10px] text-gray-400 italic">Sem matrículas</span>}
                    </div>
                  </TableCell>

                  <TableCell>
                    <select
                      className="border rounded-md p-1.5 text-xs bg-white w-full max-w-[160px] font-medium border-slate-200"
                      value={u.company_id || ""}
                      onChange={async (e) => {
                        const val = e.target.value === "" ? null : Number(e.target.value);
                        const res = await linkStudentToCompany(u.id, val);
                        if (res.success) fetchData();
                      }}
                    >
                      <option value="">Sem Empresa</option>
                      {allCompanies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-7 px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleViewCerts(u.id)}
                      disabled={!u.enrollments?.some((e: any) => e.progress === 100)}
                    >
                      <Award className="w-3.5 h-3.5 mr-1" /> Certificados
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* MODAL CERTIFICADOS */}
        {selectedCerts && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-4 relative shadow-2xl">
              <button onClick={() => setSelectedCerts(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <h2 className="font-bold text-lg mb-4 text-[#00324F]">Certificados Disponíveis</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {selectedCerts.map((c, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2 text-sm">
                    <span className="font-medium text-slate-700">{c.title}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{c.certificate_code}</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-[#00324F]" onClick={() => setSelectedCerts(null)}>Fechar</Button>
            </Card>
          </div>
        )}

        {/* MODAL MATRÍCULA */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowEnrollModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-red-500"><X size={24} /></button>
              <CardHeader><CardTitle className="text-[#00324F]">Matricular em Novo Curso</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Aluno</Label>
                    <select
                      className="w-full p-2 border rounded-md text-sm bg-white border-slate-300"
                      required
                      onChange={(e) => setEnrollData({ ...enrollData, userId: e.target.value })}
                    >
                      <option value="">Selecione um aluno...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.first_name} ({u.email})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Curso</Label>
                    <select
                      className="w-full p-2 border rounded-md text-sm bg-white border-slate-300"
                      required
                      onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value })}
                    >
                      <option value="">Selecione um treinamento...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  {enrollMessage.text && (
                    <div className={`p-3 rounded-md text-xs font-bold ${enrollMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                      {enrollMessage.text}
                    </div>
                  )}
                  <Button type="submit" className="w-full bg-[#00324F] h-12 text-lg font-black hover:bg-blue-900 transition-colors">
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