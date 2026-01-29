"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllUsers } from "@/lib/auth-actions"
import { getAllCoursesAction, enrollUserInCourseAction } from "@/lib/course-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollData, setEnrollData] = useState({ userId: "", courseId: "" })
  const [enrollMessage, setEnrollMessage] = useState({ type: "", text: "" })

  const fetchData = async () => {
    if (!user?.email) return
    setLoading(true)
    const resUsers = await getAllUsers(user.email)
    const resCourses = await getAllCoursesAction()
    
    if (resUsers.success) setUsers(resUsers.users)
    if (resCourses.success) setCourses(resCourses.courses)
    setLoading(false)
  }

  useEffect(() => { if (!authLoading && user) fetchData() }, [user, authLoading])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrollMessage({ type: "info", text: "Processando..." })
    
    const res = await enrollUserInCourseAction(Number(enrollData.userId), Number(enrollData.courseId))
    
    if (res.success) {
      setEnrollMessage({ type: "success", text: "Matrícula realizada com sucesso!" })
      setTimeout(() => {
        setShowEnrollModal(false)
        setEnrollMessage({ type: "", text: "" })
      }, 2000)
    } else {
      setEnrollMessage({ type: "error", text: res.error })
    }
  }

  if (authLoading || user?.role !== 'admin') return <div className="p-8 text-center">Verificando...</div>

  const [selectedCerts, setSelectedCerts] = useState<any[] | null>(null);

const handleViewCerts = async (id: number) => {
  const res = await getUserCertificatesAction(id);
  if (res.success) setSelectedCerts(res.certificates);
};

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#00324F]">Gestão de Usuários</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2" /> Atualizar</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowEnrollModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Matricular em Curso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Usuários no Sistema</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>#{u.id}</TableCell>
                  <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))}

              <TableCell>
  <Button variant="outline" size="sm" onClick={() => handleViewCerts(u.id)}>
    Ver Certificados
  </Button>
</TableCell>

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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL DE MATRÍCULA */}
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
                    onChange={(e) => setEnrollData({...enrollData, userId: e.target.value})}
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
                    onChange={(e) => setEnrollData({...enrollData, courseId: e.target.value})}
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

