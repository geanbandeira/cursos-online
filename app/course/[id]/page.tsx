"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MobileNav } from "@/components/MobileNav"
import { GraduationCap } from "lucide-react"
import {
  ChevronLeft,
  Play,
  Clock,
  CheckCircle,
  Lock,
  User,
  LogOut,
  ChevronDown,
  CreditCard,
  Smartphone,
  FileText,
  ShoppingCart,
  Check,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { checkUserEnrollment, getUserIdByEmail, markLessonAsCompleted, getUserProgress } from "@/lib/course-actions"
import Script from "next/script"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  level: string
  total_duration: string
  image_url: string
  price: number
  original_price: number
  pix_link?: string
  boleto_link?: string
  credit_card_link?: string // Adicionado campo para link do cartão de crédito
}

interface Lesson {
  id: number
  title: string
  description: string
  vimeo_id: string
  vimeo_url: string
  lesson_order: number
  duration: string
  is_preview: boolean
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const isFreeCourse = courseId === "11"; 

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentLoading, setEnrollmentLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [userProgress, setUserProgress] = useState<{
    completed: number
    total: number
    percentage: number
    completedLessons: number[]
  } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const vimeoPlayerRef = useRef<any>(null)
  const { user, signOut } = useAuth()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("[v0] Buscando dados do curso:", courseId)
        const response = await fetch(`/api/courses/${courseId}`)
        if (!response.ok) throw new Error("Erro ao buscar curso")

        const courseData = await response.json()
        console.log("[v0] Curso carregado:", courseData.title)
        setCourse(courseData)
      } catch (error) {
        console.error("[v0] Erro ao carregar curso:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchLessons = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/lessons`)
        if (!response.ok) throw new Error("Erro ao buscar lições")

        const lessonsData = await response.json()
        setLessons(lessonsData)
      } catch (error) {
        console.error("Erro ao carregar lições:", error)
      } finally {
        setLessonsLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
      fetchLessons()
    }
  }, [courseId])

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user?.email) {
        setEnrollmentLoading(false)
        return
      }

      try {
        const userResult = await getUserIdByEmail(user.email)
        if (userResult.success && userResult.userId) {
          setCurrentUserId(userResult.userId.toString())
          const enrollmentResult = await checkUserEnrollment(userResult.userId, Number.parseInt(courseId))
          setIsEnrolled(enrollmentResult.enrolled)

          if (enrollmentResult.enrolled) {
            const progressResult = await getUserProgress(userResult.userId.toString(), Number.parseInt(courseId))
            if (progressResult.success) {
              setUserProgress(progressResult.progress)
            }
          }
        }
      } catch (error) {
        console.error("[v0] Erro ao verificar matrícula:", error)
      } finally {
        setEnrollmentLoading(false)
      }
    }

    if (user && courseId) {
      checkEnrollment()
    } else {
      setEnrollmentLoading(false)
    }
  }, [user, courseId])

  const handleMarkAsCompleted = async () => {
    if (!selectedLesson || !currentUserId || !isEnrolled) return

    setMarkingComplete(true)
    try {
      const result = await markLessonAsCompleted(currentUserId, selectedLesson.id)
      if (result.success) {
        // Atualizar progresso
        const progressResult = await getUserProgress(currentUserId, Number.parseInt(courseId))
        if (progressResult.success) {
          setUserProgress(progressResult.progress)
        }
      }
    } catch (error) {
      console.error("[v0] Erro ao marcar aula como concluída:", error)
    } finally {
      setMarkingComplete(false)
    }
  }

  const isLessonCompletedByUser = (lessonId: number) => {
    return userProgress?.completedLessons.includes(lessonId) || false
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLessonSelect = (lesson: Lesson) => {
  if (lesson.is_preview || isEnrolled || lesson.lesson_order <= 3) {
    setSelectedLesson(lesson)
  } else {
    setShowPurchaseModal(true)
  }
}

  const canAccessLesson = (lesson: Lesson) => {
  // Se o usuário estiver logado e matriculado, ele acessa tudo
  if (isEnrolled) return true;

  // Se for o curso 11 (Grátis), bloqueia TUDO para quem não está logado
  if (isFreeCourse) {
    return false; 
  }

  // Regra para outros cursos (pagos)
  return lesson.is_preview || lesson.lesson_order <= 3;
}

  const PurchaseModal = () => {
  if (!showPurchaseModal || !course) return null;

  // DESIGN 2026 para o curso grátis
  if (isFreeCourse) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-[2.5rem] max-w-md w-full p-10 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
            <GraduationCap className="w-12 h-12 text-[#00324F] -rotate-3" />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
            Continue sua Jornada!
          </h2>
          <p className="text-gray-600 mb-10 text-lg leading-relaxed">
            As aulas seguintes são exclusivas para alunos cadastrados. É rápido, fácil e <span className="font-bold text-[#00324F]">totalmente gratuito</span>.
          </p>
          
          <div className="space-y-4">
            <Link href="/auth/register">
              <Button className="w-full bg-[#00324F] py-8 rounded-2xl font-black text-lg hover:bg-[#004A75] shadow-lg shadow-blue-900/20 transition-all">
                CRIAR CONTA AGORA
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full text-gray-500 font-bold hover:bg-gray-50 py-6">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
          
          <button 
            onClick={() => setShowPurchaseModal(false)} 
            className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }


    const pixMessage = `Olá! Segue o comprovante do pagamento PIX do curso ${course.title}.`
    const whatsappUrl = `https://wa.me/5511995702066?text=${encodeURIComponent(pixMessage)}`
    const creditCardUrl = "https://pag.ae/7_P9FAYHQ"

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center mb-6">
            <ShoppingCart className="w-12 h-12 text-[#00324F] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Adquira o Curso Completo</h2>
            <p className="text-gray-600">Para acessar todas as aulas, você precisa adquirir o curso.</p>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-2xl font-bold text-[#00324F]">R$ {course.price}</span>
                {course.original_price > course.price && (
                  <span className="text-lg text-gray-500 line-through">R$ {course.original_price}</span>
                )}
              </div>
            </div>
          </div>

          {!user ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Você precisa estar logado para comprar o curso.</p>
              <Link href="/auth/login">
                <Button className="w-full bg-[#00324F] hover:bg-[#004A75] text-white">Fazer Login</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-center mb-4">Escolha a forma de pagamento:</h4>

              {course.credit_card_link ? (
                <a
                  href={course.credit_card_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full cursor-pointer"
                >
                  <Button className="w-full bg-[#00324F] hover:bg-[#004A75] text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cartão de Crédito
                  </Button>
                </a>
              ) : (
                <a href={creditCardUrl} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
                  <Button className="w-full bg-[#00324F] hover:bg-[#004A75] text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cartão de Crédito
                  </Button>
                </a>
              )}

              <div className="space-y-2">
                {course.pix_link ? (
                  <a href={course.pix_link} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      PIX
                    </Button>
                  </a>
                ) : (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                    onClick={() => {
                      navigator.clipboard.writeText("pagamentos@masterproject.com.br")
                      alert("Chave PIX copiada! Use: pagamentos@masterproject.com.br")
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    PIX
                  </Button>
                )}
                {!course.pix_link && (
                  <>
                    <p className="text-xs text-gray-600 text-center">Chave: pagamentos@masterproject.com.br</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                      <Button
                        variant="outline"
                        className="w-full text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                      >
                        Enviar Comprovante via WhatsApp
                      </Button>
                    </a>
                  </>
                )}
              </div>

              {course.boleto_link ? (
                <a
                  href={course.boleto_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full cursor-pointer"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Boleto Bancário
                  </Button>
                </a>
              ) : (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  onClick={() => alert("Funcionalidade de boleto será implementada em breve.")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Boleto Bancário
                </Button>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowPurchaseModal(false)}>
            Fechar
          </Button>
        </div>
      </div>
    )
  }

  const playNextLesson = () => {
    if (!selectedLesson || !lessons.length || isTransitioning) return

    setIsTransitioning(true)
    const currentIndex = lessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < lessons.length) {
      const nextLesson = lessons[nextIndex]
      if (canAccessLesson(nextLesson)) {
        console.log("[v0] Avançando para próxima aula:", nextLesson.title)
        setSelectedLesson(nextLesson)

        // Reset transition flag after a delay
        setTimeout(() => {
          setIsTransitioning(false)
        }, 2000)
      } else {
        setIsTransitioning(false)
      }
    } else {
      setIsTransitioning(false)
    }
  }

  useEffect(() => {
    if (!selectedLesson || !selectedLesson.vimeo_id || !canAccessLesson(selectedLesson)) {
      return
    }

    const initializeVimeoPlayer = () => {
      const iframe = document.querySelector('iframe[src*="vimeo.com"]')
      if (!iframe) {
        console.log("[v0] Iframe do Vimeo não encontrado")
        return false
      }

      // Verificar se a API do Vimeo está disponível
      if (typeof window === "undefined" || !window.Vimeo || !window.Vimeo.Player) {
        console.log("[v0] Vimeo API não disponível ainda")
        return false
      }

      try {
        // Destruir player anterior se existir
        if (vimeoPlayerRef.current) {
          console.log("[v0] Destruindo player anterior")
          try {
            vimeoPlayerRef.current.off("ended")
            vimeoPlayerRef.current.off("play")
            vimeoPlayerRef.current.off("pause")
            vimeoPlayerRef.current.off("timeupdate")
            vimeoPlayerRef.current.destroy()
          } catch (error) {
            console.log("[v0] Erro ao destruir player anterior:", error)
          }
          vimeoPlayerRef.current = null
        }

        // Criar novo player
        console.log("[v0] Criando novo player do Vimeo para:", selectedLesson.title)
        vimeoPlayerRef.current = new window.Vimeo.Player(iframe)

        // Aguardar o player estar pronto
        vimeoPlayerRef.current
          .ready()
          .then(() => {
            console.log("[v0] ✅ Player do Vimeo inicializado com sucesso!")

            if (isTransitioning) {
              console.log("[v0] 🎬 Forçando play após transição automática...")
              vimeoPlayerRef.current
                .play()
                .then(() => {
                  console.log("[v0] ✅ Autoplay iniciado com sucesso!")
                })
                .catch((error) => {
                  console.log("[v0] ⚠️ Autoplay bloqueado pelo browser:", error)
                  // Tentar novamente após um pequeno delay
                  setTimeout(() => {
                    vimeoPlayerRef.current.play().catch(() => {
                      console.log("[v0] ⚠️ Autoplay definitivamente bloqueado - usuário precisa clicar")
                    })
                  }, 1000)
                })
            }

            // Registrar evento de fim do vídeo
            vimeoPlayerRef.current.on("ended", () => {
              console.log("[v0] 🎬 VÍDEO TERMINOU! Iniciando autoplay...")

              if (isEnrolled && currentUserId && selectedLesson && !isLessonCompletedByUser(selectedLesson.id)) {
                console.log("[v0] ✅ Marcando lição como concluída automaticamente...")
                markLessonAsCompleted(currentUserId, selectedLesson.id)
                  .then((result) => {
                    if (result.success) {
                      console.log("[v0] ✅ Lição marcada como concluída com sucesso!")
                      // Atualizar progresso
                      return getUserProgress(currentUserId, Number.parseInt(courseId))
                    }
                  })
                  .then((progressResult) => {
                    if (progressResult && progressResult.success) {
                      setUserProgress(progressResult.progress)
                    }
                  })
                  .catch((error) => {
                    console.error("[v0] ❌ Erro ao marcar lição como concluída automaticamente:", error)
                  })
              }

              playNextLesson()
            })

            // Eventos de debug
            vimeoPlayerRef.current.on("play", () => {
              console.log("[v0] ▶️ Vídeo iniciado")
            })

            vimeoPlayerRef.current.on("pause", () => {
              console.log("[v0] ⏸️ Vídeo pausado")
            })

            vimeoPlayerRef.current.on("timeupdate", (data) => {
              vimeoPlayerRef.current.getDuration().then((duration) => {
                const remaining = duration - data.seconds
                if (remaining <= 3 && remaining > 0) {
                  console.log("[v0] ⏰ Restam", Math.ceil(remaining), "segundos")
                }
              })
            })

            console.log("[v0] ✅ Todos os eventos registrados")
          })
          .catch((error) => {
            console.error("[v0] ❌ Erro ao inicializar player:", error)
          })

        return true
      } catch (error) {
        console.error("[v0] ❌ Erro ao criar player do Vimeo:", error)
        return false
      }
    }

    // Sistema de retry melhorado
    let retryCount = 0
    const maxRetries = 10
    let retryInterval

    const tryInitialize = () => {
      retryCount++
      console.log(`[v0] 🔄 Tentativa ${retryCount}/${maxRetries} de inicializar player`)

      const success = initializeVimeoPlayer()

      if (success) {
        console.log("[v0] ✅ Player inicializado com sucesso!")
        if (retryInterval) {
          clearInterval(retryInterval)
        }
      } else if (retryCount < maxRetries) {
        console.log("[v0] ⏳ Tentando novamente em 1 segundo...")
      } else {
        console.error("[v0] ❌ Falha ao inicializar player após", maxRetries, "tentativas")
        if (retryInterval) {
          clearInterval(retryInterval)
        }
      }
    }

    // Aguardar um tempo para o iframe ser renderizado, depois tentar inicializar
    const initialTimeout = setTimeout(() => {
      tryInitialize()

      // Se não conseguiu na primeira tentativa, tentar a cada segundo
      if (!vimeoPlayerRef.current) {
        retryInterval = setInterval(() => {
          if (retryCount >= maxRetries || vimeoPlayerRef.current) {
            clearInterval(retryInterval)
            return
          }
          tryInitialize()
        }, 1000)
      }
    }, 2000)

    return () => {
      clearTimeout(initialTimeout)
      if (retryInterval) {
        clearInterval(retryInterval)
      }

      if (vimeoPlayerRef.current) {
        try {
          console.log("[v0] 🧹 Limpando player do Vimeo")
          vimeoPlayerRef.current.off("ended")
          vimeoPlayerRef.current.off("play")
          vimeoPlayerRef.current.off("pause")
          vimeoPlayerRef.current.off("timeupdate")
          vimeoPlayerRef.current.destroy()
        } catch (error) {
          console.error("[v0] Erro ao limpar player:", error)
        }
        vimeoPlayerRef.current = null
      }
    }
  }, [selectedLesson, isTransitioning])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00324F]"></div>
          <p className="mt-4 text-gray-600">Carregando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Curso não encontrado.</p>
          <Link href="/">
            <Button className="mt-4">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        src="https://player.vimeo.com/api/player.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("[v0] 📦 Vimeo Player API carregada com sucesso!")
          // Aguardar um pouco para garantir que a API esteja totalmente disponível
          setTimeout(() => {
            if (window.Vimeo && window.Vimeo.Player) {
              console.log("[v0] ✅ Vimeo.Player disponível!")
            } else {
              console.log("[v0] ⚠️ Vimeo.Player ainda não disponível")
            }
          }, 500)
        }}
        onError={(error) => {
          console.error("[v0] ❌ Erro ao carregar Vimeo Player API:", error)
        }}
      />

      {/* Header Master Project 2026 - Corrigido */}
<header className="bg-white border-b border-gray-100 sticky top-0 z-[50] w-full h-20 sm:h-24 shadow-sm">
  <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
    <div className="flex justify-between items-center h-full gap-4">
      
      {/* LADO ESQUERDO: Menu e Logo */}
      <div className="flex items-center space-x-4 sm:space-x-8">
        {/* Hamburger Menu com Z-index isolado */}
        <div className="relative z-[60]">
          <MobileNav 
            completedLessons={userProgress?.completed || 0} 
            totalLessons={userProgress?.total || 0} 
          />
        </div>

        <Link href="/" className="flex-shrink-0">
          <img
            src="/logo-master-project.png"
            alt="Master Project"
            className="h-12 sm:h-16 w-auto transition-transform hover:scale-105"
          />
        </Link>

        {/* Info do Curso - Visível apenas em telas maiores para não "quebrar" */}
        <div className="hidden lg:block border-l border-gray-200 pl-8">
          <h1 className="text-lg font-black text-[#00324F] uppercase tracking-tight line-clamp-1">
            {course.title}
          </h1>
          <p className="text-xs text-blue-600 font-bold tracking-widest uppercase">
            {course.instructor}
          </p>
        </div>
      </div>

      {/* LADO DIREITO: Ações e Perfil */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        {/* Botão de Voltar (Estratégico) */}
        <Link href="/my-courses" className="hidden sm:block">
          <Button variant="ghost" className="text-gray-500 font-bold hover:text-[#00324F]">
            <ChevronLeft className="w-5 h-5 mr-1" /> Painel
          </Button>
        </Link>

        {/* Badge de Nível */}
        <Badge variant="secondary" className="hidden md:flex bg-gray-100 font-black px-4 py-1.5">
          {course.level}
        </Badge>

        {/* Perfil do Aluno Minimimalista */}
        {user && (
          <div className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-2xl border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#00324F] flex items-center justify-center text-white font-black">
              {user.name[0]}
            </div>
            <span className="hidden xl:inline text-xs font-black text-gray-800 uppercase">
              {user.name.split(" ")[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Sidebar - Lista de Lições */}
        <div className="w-full lg:w-80 bg-white shadow-lg border-r-0 lg:border-r border-gray-200 flex flex-col order-2 lg:order-1">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Conteúdo do Curso</h2>
            </div>
            <p className="text-sm text-gray-600">
              {course.total_duration} • {lessons.length} aulas
            </p>
            {!enrollmentLoading && (
              <div className="mt-2">
                {isEnrolled ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800">Curso Adquirido</Badge>
                    {userProgress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Progresso do curso</span>
                          <span>
                            {userProgress.completed}/{userProgress.total} aulas
                          </span>
                        </div>
                        <Progress value={userProgress.percentage} className="h-2" />
                        <p className="text-xs text-gray-500">{userProgress.percentage}% concluído</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Apenas Previews Disponíveis
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
            {lessonsLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#00324F]"></div>
                <p className="mt-2 text-sm text-gray-600">Carregando conteúdo do curso...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600">Nenhuma aula disponível.</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {lessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all duration-200 border-0 ${selectedLesson?.id === lesson.id ? "bg-blue-50 shadow-md" : "hover:bg-gray-50 shadow-sm"
                      } ${!canAccessLesson(lesson) ? "opacity-75" : ""}`}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {isLessonCompletedByUser(lesson.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : lesson.is_preview ? (
                            <Play className="w-4 h-4 text-blue-600" />
                          ) : canAccessLesson(lesson) ? (
                            selectedLesson?.id === lesson.id ? (
                              <Play className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-600" />
                            )
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">Aula {lesson.lesson_order}</span>

                            {!!lesson.is_preview && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">PREVIEW</span>
                            )}
                            {isLessonCompletedByUser(lesson.id) && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">CONCLUÍDA</span>
                            )}
                            {!isLessonCompletedByUser(lesson.id) && isEnrolled && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 rounded">NÃO CONCLUÍDO</span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {lesson.duration}
                            </span>
                          </div>
                          <h3
                            className={`text-sm font-medium leading-tight ${selectedLesson?.id === lesson.id ? "text-blue-900" : "text-gray-900"
                              }`}
                          >
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Video Player */}
        <div className="flex-1 flex flex-col order-1 lg:order-2 w-full">
          <div className="flex-1 bg-white relative w-full h-[60vh] lg:h-full">
            {selectedLesson ? (
  <div className="w-full h-full">
    {selectedLesson.vimeo_id && canAccessLesson(selectedLesson) ? (
      <iframe
        key={selectedLesson.id}
        src={`https://player.vimeo.com/video/${selectedLesson.vimeo_id}?h=0&title=0&byline=0&portrait=0&autoplay=1`}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={selectedLesson.title}
      />
    ) : (
      /* ABAIXO: Visual de Bloqueio Personalizado 2026 */
      <div className="flex items-center justify-center h-full bg-slate-50/50 backdrop-blur-md">
        <div className="text-center p-8 max-w-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#00324F]/5 blur-3xl rounded-full"></div>
            <Lock className="w-20 h-20 mx-auto text-[#00324F] opacity-20 relative z-10" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            {isFreeCourse ? "Acesso Gratuito Exclusivo" : "Conteúdo Bloqueado"}
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            {isFreeCourse 
              ? "Esta Aula é gratuita! Para assistir e interagir, você só precisa entrar na sua conta ou se cadastrar agora." 
              : "Este conteúdo é exclusivo para alunos matriculados. Faça o cadastro para liberar o acesso."}
          </p>

          <div className="mt-8 space-y-3">
            {isFreeCourse ? (
              <>
                <Link href="/auth/register" className="block w-full">
                  <Button className="w-full bg-[#00324F] hover:bg-[#004A75] text-white font-black py-7 rounded-2xl shadow-xl transition-all active:scale-95">
                    CRIAR MINHA CONTA GRÁTIS
                  </Button>
                </Link>
                <Link href="/auth/login" className="block w-full">
                  <Button variant="ghost" className="w-full text-gray-400 font-bold py-4">
                    Já tenho conta, entrar
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full bg-[#00324F] hover:bg-[#004A75] text-white font-black py-7 rounded-2xl shadow-xl"
              >
                ADQUIRIR CURSO
              </Button>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
) : (
  /* Mensagem quando nenhuma aula está selecionada */
  <div className="flex items-center justify-center h-full text-gray-900">
    <div className="text-center">
      <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h2 className="text-2xl font-semibold mb-2">Selecione uma aula</h2>
      <p className="text-gray-600">Escolha um conteúdo ao lado para começar.</p>
    </div>
  </div>
)}
          </div>

          {/* Banner de Conversão para Curso Grátis */}
{isFreeCourse && !user && (
  <div className="max-w-4xl mx-auto mt-8 mb-8 p-1">
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#00324F] via-[#004A75] to-[#001F33] p-8 shadow-2xl">
      {/* Detalhe visual de fundo */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
            🚀 Acesso Total Liberado
          </h3>
          <p className="text-blue-100/80 text-lg font-medium">
            Crie sua conta grátis para desbloquear o curso completo.
          </p>
        </div>
        <Link href="/auth/register">
          <Button className="bg-white text-[#00324F] hover:bg-blue-50 text-lg font-black px-10 py-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
            CADASTRAR GRÁTIS
          </Button>
        </Link>
      </div>
    </div>
  </div>
)}

          {/* Video Info */}
          {selectedLesson && (
            <div className="bg-white border-t border-gray-200 p-4 lg:p-6">
              <div className="max-w-4xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h1>
                    {selectedLesson.description && (
                      <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{selectedLesson.description}</p>
                    )}
                  </div>
                  {isEnrolled && canAccessLesson(selectedLesson) && (
                    <div className="ml-4">
                      {isLessonCompletedByUser(selectedLesson.id) ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluída
                        </Badge>
                      ) : (
                        <Button
                          onClick={handleMarkAsCompleted}
                          disabled={markingComplete}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {markingComplete ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Check className="w-4 h-4 mr-1" />
                              Marcar como Concluída
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <span>
                    Aula {selectedLesson.lesson_order} de {lessons.length}
                  </span>
                  {selectedLesson.is_preview && (
                    <Badge className="bg-blue-100 text-blue-800">Preview Gratuito</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de compra */}
      <PurchaseModal />
    </div>
  )
}
