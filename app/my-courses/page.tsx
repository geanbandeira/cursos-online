"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MobileNav } from "@/components/MobileNav"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle, GraduationCap, LogIn, Sparkles } from "lucide-react"
import { getUserIdByEmail, getUserEnrolledCourses, getUserProgress, getRecommendedCourses } from "@/lib/course-actions"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { ptBR } from 'date-fns/locale'


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
  const [totalCompletedLessons, setTotalCompletedLessons] = useState(0)
  const [totalLessonsCount, setTotalLessonsCount] = useState(0) // Estado para o total real de aulas
  const [totalCourseDuration, setTotalCourseDuration] = useState("0h 0min")
  const { user, loading: authLoading } = useAuth()
  const [recommendedCourses, setRecommendedCourses] = useState<EnrolledCourse[]>([])
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const rawLastLoginAt = user?.lastLoginAt || new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const [lastLoginDisplay, setLastLoginDisplay] = useState({ full: "Aguardando...", friendly: "..." })

  // --- ATUALIZAÇÃO DO ÚLTIMO ACESSO ---
  useEffect(() => {
    const updateTimeDisplay = () => {
      if (rawLastLoginAt && rawLastLoginAt !== 'Data indisponível') {
        const date = parseISO(rawLastLoginAt)
        const fullDate = format(date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
        const friendlyDistance = formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
        setLastLoginDisplay({
          full: fullDate.charAt(0).toUpperCase() + fullDate.slice(1),
          friendly: friendlyDistance
        })
      }
    }
    updateTimeDisplay()
    const timer = setInterval(updateTimeDisplay, 60000)
    return () => clearInterval(timer)
  }, [rawLastLoginAt])

  // --- CARROSSEL AUTOMÁTICO ---
  useEffect(() => {
    if (recommendedCourses.length === 0) return
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' })
        }
      }
    }, 5000) // 5 segundos para uma leitura confortável
    return () => clearInterval(interval)
  }, [recommendedCourses])

  // --- LÓGICA DE BUSCA DE DADOS REAIS ---
  useEffect(() => {
    if (authLoading) return

    const fetchAllData = async () => {
      if (!user) {
        router.push("/auth/login")
        setLoading(false)
        return
      }

      try {
        const userResult = await getUserIdByEmail(user.email)
        if (userResult.success && userResult.userId) {
          const userIdString = userResult.userId.toString()

          // 1. Cursos matriculados
          const coursesResult = await getUserEnrolledCourses(userIdString)
          if (coursesResult.success) {
            const fetchedCourses = coursesResult.courses as EnrolledCourse[]
            setCourses(fetchedCourses)

            let completedSum = 0
            let totalSum = 0
            let totalMin = 0

            // BUSCA O PROGRESSO REAL DE CADA CURSO
            await Promise.all(fetchedCourses.map(async (course) => {
              totalMin += parseDurationToMinutes(course.total_duration)
              const progressResult = await getUserProgress(userIdString, course.id)
              if (progressResult.success && progressResult.progress) {
                completedSum += progressResult.progress.completed //
                totalSum += progressResult.progress.total //
              }
            }))

            setTotalCompletedLessons(completedSum)
            setTotalLessonsCount(totalSum)
            setTotalCourseDuration(formatMinutesToHoursAndMinutes(totalMin))
          }

          // 2. Recomendações
          const recResult = await getRecommendedCourses(userIdString)
          if (recResult.success) {
            setRecommendedCourses(recResult.courses as EnrolledCourse[])
          }
        }
      } catch (error) {
        console.error("Erro no fetch de dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [user, router, authLoading])

  // --- FUNÇÕES AUXILIARES ---
  const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 0
    const parts = duration.match(/(\d+)\s*(h|min)/g)
    if (!parts) return 0
    let total = 0
    parts.forEach(p => {
      const val = parseInt(p.match(/\d+/)?.[0] || '0')
      if (p.includes('h')) total += val * 60
      else if (p.includes('min')) total += val
    })
    return total
  }

  const formatMinutesToHoursAndMinutes = (min: number): string => {
    return `${Math.floor(min / 60)}h ${min % 60}min`
  }

  const getFormattedDateAndGreeting = () => {
    const today = new Date()
    const dateStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(today)
    const finalDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    const hour = today.getHours()
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
    return { fullDate: finalDate, greeting }
  }

  const { fullDate, greeting } = getFormattedDateAndGreeting()

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00324F]"></div>
      </div>
    )
  }

  const stats = [
    { title: "Cursos Ativos", value: courses.length, icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Aulas Concluídas", value: totalCompletedLessons, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Total de Horas", value: totalCourseDuration, icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Próxima Meta", value: "Certificado", icon: GraduationCap, color: "text-purple-600", bgColor: "bg-purple-50" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              {/* MENU COM PROGRESSO REAL */}
              <MobileNav 
                completedLessons={totalCompletedLessons} 
                totalLessons={totalLessonsCount} 
              />
              <Link href="/">
                <img
                  src="/logo-master-project.png"
                  alt="Master Project"
                  className="h-14 sm:h-16 w-auto transition-transform hover:scale-105"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">{greeting}, {user?.name || "Aluno(a)"}!</h1>
          <div className="flex items-center text-gray-500 mt-2">
            <Calendar className="w-4 h-4 mr-2" /> <span>{fullDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <Card key={i} className="flex flex-row items-center p-4 border-0 shadow-md">
              <div className={`p-3 rounded-full ${s.bgColor} ${s.color} mr-4`}><s.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">{s.title}</p>
                <CardTitle className="text-xl font-bold">{s.value}</CardTitle>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white shadow-lg border-0 overflow-hidden flex flex-col h-full">
              <img src={course.image_url || "/placeholder.jpg"} className="h-48 w-full object-cover" alt={course.title} />
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  <span className="text-sm text-gray-500">{course.total_duration}</span>
                </div>
                <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <CardDescription className="line-clamp-2 mb-6">{course.description}</CardDescription>
                <div className="mt-auto space-y-2">
                  <Link href={`/course/${course.id}`}><Button className="w-full bg-[#00324F]"><BookOpen className="w-4 h-4 mr-2" /> Acessar</Button></Link>
                  <Link href={`/course/${course.id}/materiais`}><Button variant="outline" className="w-full">Materiais</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendedCourses.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><Sparkles className="w-6 h-6 mr-2 text-orange-500" /> Expanda seus horizontes</h2>
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {recommendedCourses.map((c) => (
                <div key={c.id} className="min-w-[320px] snap-center">
                  <Card className="hover:shadow-2xl transition-all border-gray-100 overflow-hidden">
                    <img src={c.image_url || "/logonave.webp"} className="h-44 w-full object-cover" alt={c.title} />
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 truncate">{c.title}</h3>
                      <Link href={`/course/${c.id}`}><Button className="w-full bg-[#00324F] py-5 font-bold rounded-xl">Quero conhecer</Button></Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full text-right mt-10 text-xs text-gray-400">
          <LogIn className="inline w-3 h-3 mr-1" /> Último acesso: <span title={lastLoginDisplay.full}>{lastLoginDisplay.friendly}</span>
        </div>
      </main>
    </div>
  )
}