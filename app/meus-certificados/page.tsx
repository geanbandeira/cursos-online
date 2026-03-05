"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getMyCertificatesAction, getUserIdByEmail } from "@/lib/course-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Download, ExternalLink, Share2, Medal } from "lucide-react"
import Link from "next/link"

export default function MyCertificatesPage() {
  const { user, loading: authLoading } = useAuth()
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCerts = async () => {
      if (!user?.email) return
      
      const userRes = await getUserIdByEmail(user.email)
      if (userRes.success && userRes.userId) {
        const res = await getMyCertificatesAction(userRes.userId.toString())
        if (res.success) setCertificates(res.certificates)
      }
      setLoading(false)
    }

    if (!authLoading) fetchCerts()
  }, [user, authLoading])

  if (loading || authLoading) return <div className="p-20 text-center animate-pulse">Carregando conquistas...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#00324F] text-white py-12 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Medal className="w-12 h-12 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-bold">Meus Certificados</h1>
            <p className="text-blue-100 mt-1">Sua jornada de aprendizado e maestria na Master Project.</p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 mt-10">
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-none shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video w-full bg-gray-100 relative group">
                  <img 
                    src={cert.image_url} 
                    alt={cert.course_title} 
                    className="object-cover w-full h-full border-b"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Button variant="secondary" asChild>
                        <a href={cert.pdf_url} target="_blank">Visualizar em Tela Cheia</a>
                     </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-[#00324F]">{cert.course_title}</CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px]">{cert.certificate_code}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">Emitido em: {new Date(cert.issue_date).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button className="flex-1 bg-[#00324F]" asChild>
                    <a href={cert.pdf_url} download={`Certificado-${cert.course_title}.pdf`}>
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </a>
                  </Button>
                  {/* Novo Botão de Validação e LinkedIn */}
                  {/*
  <Button 
    variant="outline" 
    className="flex-1 border-[#00324F] text-[#00324F] hover:bg-blue-50"
    onClick={() => {
      const shareUrl = `https://masterproject.com.br/validacao?codigo=${cert.certificate_code}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank');
    }}
  >
    <Share2 className="w-4 h-4 mr-2" /> LinkedIn
  </Button>*/}

  {/* Botão para ir direto à página de Validação */}
  <Button 
    variant="ghost" 
    size="sm" 
    title="Validar Certificado"
    asChild
  >
    <a href={`https://masterproject.com.br/validacao?codigo=${cert.certificate_code}`} target="_blank">
      <ExternalLink className="w-4 h-4" />
    </a>
  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400">Você ainda não possui certificados emitidos.</h3>
            <p className="text-gray-400 mt-2">Conclua 100% de um curso para solicitar sua certificação.</p>
            <Link href="/my-courses">
              <Button className="mt-6 bg-[#00324F]">Voltar para Meus Cursos</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}