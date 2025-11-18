"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen } from "lucide-react"
import { getUserIdByEmail } from "@/lib/course-actions"
// Importe a nova função que criamos
import { getUserEnrolledCourses } from "@/lib/course-actions" 

// Definimos um tipo para os cursos que vamos receber
interface EnrolledCourse {
  id: number
  title: string
  description: string
  image_url: string
  level: string
  total_duration: string
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  // <<< MUDANÇA 1: Renomeie 'loading' do useAuth para 'authLoading'
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // <<< MUDANÇA 2: Adicionamos esta verificação
    // Se a autenticação ainda estiver carregando (authLoading === true),
    // não faça nada e espere.
    if (authLoading) {
      return
    }

    // Quando authLoading for 'false', o código abaixo continua.
    // Agora, a verificação do 'user' é segura.
    const fetchEnrolledCourses = async () => {
      // 1. Verificar se o usuário está logado
      if (!user) {
        // Se não estiver (e a autenticação já terminou), redireciona para o login
        router.push("/auth/login")
        return
      }

      // Se chegou aqui, o usuário existe! Vamos buscar os cursos.
      try {
        // 2. Buscar o ID do usuário pelo email (função que já existe)
        const userResult = await getUserIdByEmail(user.email)
        
        if (userResult.success && userResult.userId) {
          // 3. Buscar os cursos matriculados (nossa nova função)
          const coursesResult = await getUserEnrolledCourses(userResult.userId.toString())
          
          if (coursesResult.success) {
            setCourses(coursesResult.courses as EnrolledCourse[])
          }
        }
      } catch (error) {
        console.error("Erro ao buscar 'Meus Cursos':", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
    // <<< MUDANÇA 3: Adicione 'authLoading' na lista de dependências
  }, [user, router, authLoading])

  // Mostrar um loader enquanto busca os dados
  // <<< MUDANÇA 4: Mostrar o spinner se 'loading' OU 'authLoading' for verdadeiro
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00324F]"></div>
          <p className="mt-4 text-gray-600">Buscando seus cursos...</p>
        </div>
      </div>
    )
  }

  // Renderizar a página
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simples */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/oie_xpWiKNePpcq7%281%29%281%29%281%29-gE6tp7np2qnWofuIkwOVfK46eagnCh.png"
                alt="Master Project"
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Cursos</h1>
          <p className="text-lg text-gray-600">
            Continue de onde parou. Acesse todos os cursos que você está matriculado.
          </p>
        </div>

        {/* Grid de Cursos */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 flex flex-col h-full"
              >
                <div className="h-48 w-full overflow-hidden rounded-t-xl">
                  <img 
                    src={course.image_url || "/placeholder.jpg"} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <span className="text-sm text-gray-500">{course.total_duration}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow flex flex-col">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed flex-grow">
                    {course.description}
                  </CardDescription>
                  <Link href={`/course/${course.id}`} className="w-full cursor-pointer mt-auto">
                    <Button className="w-full bg-[#00324F] hover:bg-[#004066] text-white font-medium py-3 px-4 rounded-lg transition duration-200 cursor-pointer">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Acessar Curso
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Mensagem para caso o usuário não tenha cursos
          <div className="text-center bg-white p-12 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-gray-800">Você ainda não se matriculou em nenhum curso</h2>
            <p className="text-gray-600 mt-2 mb-6">Explore nosso catálogo e comece a aprender hoje mesmo!</p>
            <Link href="/">
              <Button className="bg-[#00324F] hover:bg-[#004066] text-white">
                Ver Todos os Cursos
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}