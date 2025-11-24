"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle, GraduationCap } from "lucide-react" 
import { getUserIdByEmail, getUserEnrolledCourses, getUserProgress } from "@/lib/course-actions"
import { format } from "date-fns" 

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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0) // NOVO ESTADO
  const [totalCourseDuration, setTotalCourseDuration] = useState("0h 0min") // NOVO ESTADO
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // --- FUNÇÕES AUXILIARES DE CÁLCULO ---
  const parseDurationToMinutes = (duration: string): number => {
    let totalMinutes = 0
    if (!duration) return 0

    const parts = duration.match(/(\d+)\s*(h|min)/g)
    if (!parts) return 0

    parts.forEach(part => {
      const value = parseInt(part.match(/\d+/)?.[0] || '0')
      if (part.includes('h')) {
        totalMinutes += value * 60
      } else if (part.includes('min')) {
        totalMinutes += value
      }
    })
    return totalMinutes
  }

  const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}min`
  }
  // ------------------------------------

  // Lógica para o relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  
  // Função para formatar a data por extenso e calcular saudação
  const getFormattedDateAndGreeting = () => {
    const today = new Date();
    // Usa Intl.DateTimeFormat para formatação localizada (sem precisar importar locale)
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    const fullDate = dateFormatter.format(today).replace(/\s/g, ' ').replace(/,$/, ''); 

    const currentHour = parseInt(format(currentTime, "HH"));
    let greeting = "Olá";
    if (currentHour >= 6 && currentHour < 12) {
        greeting = "Bom dia";
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = "Boa tarde";
    } else {
        greeting = "Boa noite";
    }

    return { fullDate: fullDate.charAt(0).toUpperCase() + fullDate.slice(1), greeting };
  };

  const { fullDate, greeting } = getFormattedDateAndGreeting();
  const time = format(currentTime, "HH:mm:ss");

  // DEFINIÇÃO DAS ESTATÍSTICAS (AGORA COM VALORES DINÂMICOS)
  const stats = [
      { 
        title: "Cursos Ativos", 
        value: courses.length, // Valor REAL: Contagem de cursos no estado
        icon: BookOpen, 
        color: "text-blue-600", 
        bgColor: "bg-blue-50" 
      },
      { 
        title: "Aulas Concluídas", 
        value: totalCompletedLessons, // Valor REAL: Calculado no useEffect
        icon: CheckCircle, 
        color: "text-green-600", 
        bgColor: "bg-green-50" 
      },
      { 
        title: "Total de Horas", 
        value: totalCourseDuration, // Valor REAL: Calculado no useEffect
        icon: Clock, 
        color: "text-orange-600", 
        bgColor: "bg-orange-50" 
      },
      { 
        title: "Próxima Meta", 
        value: "Certificação", // Valor estático, mantido conforme sua sugestão
        icon: GraduationCap, 
        color: "text-purple-600", 
        bgColor: "bg-purple-50" 
      },
  ];

  useEffect(() => {
    if (authLoading) {
      return
    }

    const fetchEnrolledCourses = async () => {
      if (!user) {
        router.push("/auth/login")
        setLoading(false)
        return
      }

      try {
        const userResult = await getUserIdByEmail(user.email)
        
        if (userResult.success && userResult.userId) {
          const userIdString = userResult.userId.toString(); // ID do usuário

          const coursesResult = await getUserEnrolledCourses(userIdString)
          
          if (coursesResult.success) {
            const fetchedCourses = coursesResult.courses as EnrolledCourse[]
            setCourses(fetchedCourses)

            // --- CÁLCULO DAS ESTATÍSTICAS REAIS ---
            let completedCount = 0
            let totalMinutes = 0
            
            await Promise.all(fetchedCourses.map(async (course) => {
              // 1. Duração total (soma)
              totalMinutes += parseDurationToMinutes(course.total_duration)
              
              // 2. Aulas concluídas (soma, chamando a função para cada curso)
              const progressResult = await getUserProgress(userIdString, course.id)
              if (progressResult.success && progressResult.progress) {
                completedCount += progressResult.progress.completed
              }
            }))

            setTotalCompletedLessons(completedCount)
            setTotalCourseDuration(formatMinutesToHoursAndMinutes(totalMinutes))
            // ------------------------------------
          }
        }
      } catch (error) {
        console.error("Erro ao buscar 'Meus Cursos' ou progresso:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [user, router, authLoading])

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
        {/* SEÇÃO DE HEADER DINÂMICO E DATA/HORA */}
        <div className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-0">
              {greeting}, {user?.name || "Aluno(a)"}!
            </h1>
            <div className="text-left sm:text-right flex flex-col items-start sm:items-end space-y-1">
              <div className="flex items-center text-gray-600 text-sm sm:text-base">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>{fullDate}</span>
              </div>
              <div className="flex items-center text-gray-800 text-lg sm:text-xl font-mono font-semibold">
                <Clock className="w-4 h-4 mr-2 text-[#00324F]" />
                <span>{time}</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 mt-2">
            Acesse seus cursos e continue de onde parou.
          </p>
        </div>

        {/* CARTÕES DE ESTATÍSTICAS (AGORA COM DADOS REAIS/CALCULADOS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="flex flex-row items-center p-4 border-0 shadow-md transition-shadow duration-300 hover:shadow-xl">
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color} mr-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <CardTitle className="text-xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </CardTitle>
              </div>
            </Card>
          ))}
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