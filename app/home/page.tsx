"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { checkUserEnrollment, getUserIdByEmail } from "@/lib/course-actions"

interface CourseWithEnrollment {
  id: number
  name: string
  description: string
  duration: string
  level: string
  isEnrolled: boolean
}

const coursesData = [
  {
    id: 1,
    name: "Gestão de Projetos Avançada",
    description:
      "Aprenda metodologias ágeis e ferramentas modernas para gerenciar projetos de forma eficiente e entregar resultados excepcionais.",
    duration: "40 horas",
    level: "Intermediário",
  },
  {
    id: 2,
    name: "Liderança e Desenvolvimento de Equipes",
    description: "Desenvolva habilidades de liderança e aprenda a motivar e desenvolver equipes de alta performance.",
    duration: "30 horas",
    level: "Avançado",
  },
  {
    id: 3,
    name: "Análise de Dados para Negócios",
    description: "Domine técnicas de análise de dados e tome decisões estratégicas baseadas em informações concretas.",
    duration: "50 horas",
    level: "Intermediário",
  },
  {
    id: 4,
    name: "Marketing Digital e Growth",
    description:
      "Estratégias completas de marketing digital para acelerar o crescimento do seu negócio no ambiente online.",
    duration: "35 horas",
    level: "Básico",
  },
  {
    id: 5,
    name: "Finanças Corporativas",
    description: "Entenda planejamento financeiro, análise de investimentos e gestão de recursos para empresas.",
    duration: "45 horas",
    level: "Avançado",
  },
  {
    id: 6,
    name: "Inovação e Transformação Digital",
    description: "Lidere processos de transformação digital e implemente inovações que revolucionem seu negócio.",
    duration: "40 horas",
    level: "Intermediário",
  },
]

export default function HomePage() {
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const checkEnrollments = async () => {
      if (user?.email) {
        console.log("[v0] Verificando matrículas do usuário na home...")
        const userResult = await getUserIdByEmail(user.email)

        if (userResult.success && userResult.userId) {
          const coursesWithEnrollment = await Promise.all(
            coursesData.map(async (course) => {
              const enrollmentResult = await checkUserEnrollment(userResult.userId, course.id)
              return {
                ...course,
                isEnrolled: enrollmentResult.enrolled,
              }
            }),
          )
          setCourses(coursesWithEnrollment)
        } else {
          setCourses(coursesData.map((course) => ({ ...course, isEnrolled: false })))
        }
      } else {
        setCourses(coursesData.map((course) => ({ ...course, isEnrolled: false })))
      }
      setLoading(false)
    }

    checkEnrollments()
  }, [user?.email])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Master Project</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Início
              </Link>
              {/* ======== CÓDIGO NOVO ADICIONADO ABAIXO ======== */}
              <Link href="/my-courses" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Meus Cursos
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Consultoria
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Treinamentos
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 cursor-pointer">
                Contato
              </Link>
              <Link
                href="/"
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Sair
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Catálogo de Cursos</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desenvolva suas habilidades profissionais com nossos cursos especializados. Conteúdo de alta qualidade para
            impulsionar sua carreira.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00324F]"></div>
              <p className="mt-4 text-gray-600">Carregando cursos...</p>
            </div>
          ) : (
            courses.map((course) => (
              <Card
                key={course.id}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 flex flex-col h-full"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.level === "Básico"
                          ? "bg-green-100 text-green-800"
                          : course.level === "Intermediário"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.level}
                    </span>
                    <span className="text-sm text-gray-500">{course.duration}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow flex flex-col">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed flex-grow">
                    {course.description}
                  </CardDescription>
                  <Link href={`/course/${course.id}`} className="w-full cursor-pointer mt-auto">
                    <Button className="w-full bg-[#00324F] hover:bg-[#004066] text-white font-medium py-3 px-4 rounded-lg transition duration-200 cursor-pointer">
                      {course.isEnrolled ? "Acessar curso" : "Matricule-se agora"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-[#00324F] rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Não encontrou o que procurava?</h2>
          <p className="text-xl mb-6 opacity-90">
            Entre em contato conosco para cursos personalizados e consultoria especializada.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-[#00324F] hover:bg-gray-100 font-medium py-3 px-8 rounded-lg cursor-pointer"
          >
            Falar com Especialista
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2025 Master Project. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
