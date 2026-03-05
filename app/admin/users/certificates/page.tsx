"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllUsers } from "@/lib/auth-actions"
import { 
  getUserCertificatesAction, 
  getAllCoursesAction, 
  issueCertificateAction 
} from "@/lib/course-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Award, Plus, ExternalLink, RefreshCw, X } from "lucide-react"

export default function AdminCertificatesPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [allCertificates, setAllCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showIssueModal, setShowIssueModal] = useState(false)

  const [formData, setFormData] = useState({
    userId: "",
    courseId: "",
    code: "",
    pdfFile: "",
    jpgFile: ""
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const resUsers = await getAllUsers(user?.email || "")
      const resCourses = await getAllCoursesAction()
      
      if (resUsers.success) setUsers(resUsers.users)
      if (resCourses.success) setCourses(resCourses.courses)

      // Busca certificados de todos os usuários
      if (resUsers.success && resUsers.users.length > 0) {
        const certsPromises = resUsers.users.map(async (u: any) => {
          const r = await getUserCertificatesAction(u.id)
          if (r.success) {
            return r.certificates.map((c: any) => ({
              ...c,
              userName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email
            }))
          }
          return []
        })
        
        const results = await Promise.all(certsPromises)
        setAllCertificates(results.flat())
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') loadData()
  }, [user, authLoading])

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Previne envio de campos undefined
    const payload = {
      userId: Number(formData.userId),
      courseId: Number(formData.courseId),
      certificateCode: formData.code || "",
      pdfUrl: `https://masterproject.com.br/assets/certificados/${formData.pdfFile}`,
      imageUrl: `https://masterproject.com.br/assets/certificados/${formData.jpgFile}`
    }

    const res = await issueCertificateAction(payload)

    if (res.success) {
      alert("Certificado registrado com sucesso!")
      setFormData({ userId: "", courseId: "", code: "", pdfFile: "", jpgFile: "" }) // Limpa form
      setShowIssueModal(false)
      await loadData() // Força atualização da tabela
    } else {
      alert("Erro: " + res.error)
    }
  }

  const filteredCerts = allCertificates.filter(c => 
    c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.certificate_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || user?.role !== 'admin') return <div className="p-8 text-center">Verificando permissões...</div>

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00324F]">Central de Certificados</h1>
          <p className="text-gray-500 text-sm">Gerenciamento de documentos vinculados à Hostgator</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button className="bg-[#00324F] hover:bg-[#00253a]" onClick={() => setShowIssueModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Emitir Novo
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Buscar por aluno, curso ou código..." 
          className="pl-10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="font-bold">Aluno</TableHead>
                <TableHead className="font-bold">Curso</TableHead>
                <TableHead className="font-bold">Código</TableHead>
                <TableHead className="font-bold">Emissão</TableHead>
                <TableHead className="text-right font-bold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">Carregando certificados...</TableCell></TableRow>
              ) : filteredCerts.length > 0 ? (
                filteredCerts.map((cert) => (
                  <TableRow key={cert.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-[#00324F]">{cert.userName}</TableCell>
                    <TableCell className="text-sm">{cert.course_title}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono">{cert.certificate_code}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild title="Abrir PDF">
                        <a href={cert.pdf_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">Nenhum certificado encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="text-blue-600" /> Registrar Certificado
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowIssueModal(false)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleIssue} className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecionar Aluno</Label>
                  <select 
                    className="w-full p-2 border rounded-md text-sm bg-white" 
                    required
                    value={formData.userId}
                    onChange={e => setFormData({...formData, userId: e.target.value})}
                  >
                    <option value="">Escolha um aluno...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Curso Correspondente</Label>
                  <select 
                    className="w-full p-2 border rounded-md text-sm bg-white" 
                    required
                    value={formData.courseId}
                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                  >
                    <option value="">Escolha o curso...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Código do Certificado (Ex: CERT025)</Label>
                  <Input 
                    placeholder="Código de validação" 
                    required 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do PDF</Label>
                    <Input 
                      placeholder="arquivo.pdf" 
                      required
                      value={formData.pdfFile}
                      onChange={e => setFormData({...formData, pdfFile: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome da Imagem (JPG)</Label>
                    <Input 
                      placeholder="arquivo.jpg" 
                      required
                      value={formData.jpgFile}
                      onChange={e => setFormData({...formData, jpgFile: e.target.value})}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded border">
                  Os arquivos devem estar em: <strong>masterproject.com.br/assets/certificados/</strong>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-[#00324F] hover:bg-[#00253a]">Salvar no Sistema</Button>
                  <Button type="button" variant="outline" onClick={() => setShowIssueModal(false)}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}