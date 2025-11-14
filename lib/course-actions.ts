"use server"

import { sql } from "@/lib/database"

export async function checkUserEnrollment(userId: string, courseId: number) {
  try {
    console.log("[v0] Verificando matrícula - userId:", userId, "courseId:", courseId)

    const result = await sql`
      SELECT * FROM enrollments 
      WHERE user_id = ${Number.parseInt(userId)} AND course_id = ${courseId}
    `

    console.log("[v0] Resultado da verificação de matrícula:", result)
    return { success: true, enrolled: result.length > 0, data: result[0] || null }
  } catch (error: any) {
    console.error("[v0] Erro ao verificar matrícula:", error)
    return { success: false, error: error.message, enrolled: false }
  }
}

export async function getUserIdByEmail(email: string) {
  try {
    console.log("[v0] Buscando usuário por email:", email)

    const result = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    console.log("[v0] Resultado da busca por email:", result)
    return { success: true, userId: result[0]?.id || null }
  } catch (error: any) {
    console.error("[v0] Erro ao buscar usuário por email:", error)
    return { success: false, error: error.message, userId: null }
  }
}

export async function markLessonAsCompleted(userId: string, lessonId: number) {
  try {
    console.log("[v0] Marcando aula como concluída - userId:", userId, "lessonId:", lessonId)

    // Inserir ou atualizar o progresso da aula
    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id) 
      VALUES (${Number.parseInt(userId)}, ${lessonId})
      ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP
    `

    console.log("[v0] Aula marcada como concluída com sucesso")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Erro ao marcar aula como concluída:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserProgress(userId: string, courseId: number) {
  try {
    console.log("[v0] Buscando progresso do usuário - userId:", userId, "courseId:", courseId)

    // Buscar aulas concluídas pelo usuário neste curso
    const completedLessons = await sql`
      SELECT lp.lesson_id, lp.completed_at
      FROM lesson_progress lp
      INNER JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.user_id = ${Number.parseInt(userId)} AND l.course_id = ${courseId}
    `

    // Buscar total de aulas do curso
    const totalLessons = await sql`
      SELECT COUNT(*) as total FROM lessons WHERE course_id = ${courseId}
    `

    const completed = completedLessons.length
    const total = totalLessons[0]?.total || 0
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

    console.log("[v0] Progresso calculado:", { completed, total, progressPercentage })

    return {
      success: true,
      progress: {
        completed,
        total,
        percentage: progressPercentage,
        completedLessons: completedLessons.map((lesson) => lesson.lesson_id),
      },
    }
  } catch (error: any) {
    console.error("[v0] Erro ao buscar progresso do usuário:", error)
    return { success: false, error: error.message }
  }
}

export async function isLessonCompleted(userId: string, lessonId: number) {
  try {
    const result = await sql`
      SELECT id FROM lesson_progress 
      WHERE user_id = ${Number.parseInt(userId)} AND lesson_id = ${lessonId}
    `

    return { success: true, completed: result.length > 0 }
  } catch (error: any) {
    console.error("[v0] Erro ao verificar se aula foi concluída:", error)
    return { success: false, error: error.message, completed: false }
  }
}

// (No final do arquivo lib/course-actions.ts)

export async function getUserEnrolledCourses(userId: string) {
  try {
    console.log("[v0] Buscando cursos matriculados para o usuário:", userId)

    const result = await sql`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.level, 
        c.total_duration, 
        c.image_url
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ${Number.parseInt(userId)}
      ORDER BY c.title ASC
    `
    
    console.log("[v0] Cursos matriculados encontrados:", result.length)
    return { success: true, courses: result }
  } catch (error: any) {
    console.error("[v0] Erro ao buscar cursos matriculados:", error)
    return { success: false, error: error.message, courses: [] }
  }
}