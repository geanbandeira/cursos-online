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

// lib/course-actions.ts

export async function markLessonAsCompleted(userId: string, lessonId: number) {
  try {
    // 1. Marca a aula como concluída
    await sql`
      INSERT INTO lesson_progress (user_id, lesson_id) 
      VALUES (${Number.parseInt(userId)}, ${lessonId})
      ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP
    `;

    // 2. Busca o curso dessa lição para atualizar o progresso geral
    const lessonInfo = await sql`SELECT course_id FROM lessons WHERE id = ${lessonId}`;
    const courseId = lessonInfo[0]?.course_id;

    if (courseId) {
      // 3. Recalcula o progresso
      const progressResult = await getUserProgress(userId, courseId);
      if (progressResult.success) {
        // 4. Atualiza a tabela enrollments com a nova porcentagem
        await sql`
          UPDATE enrollments 
          SET progress = ${progressResult.progress.percentage}
          WHERE user_id = ${Number.parseInt(userId)} AND course_id = ${courseId}
        `;
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao marcar aula como concluída:", error);
    return { success: false, error: error.message };
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

// lib/course-actions.ts

// Busca todos os cursos para o dropdown do admin
export async function getAllCoursesAction() {
  try {
    const result = await sql`SELECT id, title FROM courses ORDER BY title ASC`;
    return { success: true, courses: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Realiza a matrícula manual de um aluno
export async function enrollUserInCourseAction(userId: number, courseId: number) {
  try {
    // Verifica se já está matriculado para não duplicar
    const check = await sql`SELECT id FROM enrollments WHERE user_id = ${userId} AND course_id = ${courseId}`;
    
    if (check.length > 0) {
      throw new Error("Usuário já está matriculado neste curso.");
    }

    await sql`
      INSERT INTO enrollments (user_id, course_id, enrolled_at, progress) 
      VALUES (${userId}, ${courseId}, NOW(), 0)
    `;
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// No final do arquivo lib/course-actions.ts

export async function getCourseMaterials(courseId: number) {
  try {
    console.log("[v0] Buscando materiais para o curso:", courseId);
    
    // Busca os materiais vinculados ao ID do curso
    const result = await sql`
      SELECT id, title, file_url, file_type, file_size 
      FROM course_materials 
      WHERE course_id = ${courseId}
      ORDER BY id DESC
    `;
    
    return { success: true, materials: result };
  } catch (error: any) {
    console.error("[v0] Erro ao buscar materiais:", error);
    return { success: false, materials: [], error: error.message };
  }
}

// Adicione esta função ao final do arquivo lib/course-actions.ts

export async function getRecommendedCourses(userId: string) {
  try {
    // 1. Filtra cursos que o usuário NÃO possui
    // 2. Filtra IDs 9 e 10 (Turmas Fechadas de Power BI)
    // 3. Garante que o curso está ativo
    const rows = await sql`
      SELECT * FROM courses 
      WHERE id NOT IN (SELECT course_id FROM enrollments WHERE user_id = ${Number.parseInt(userId)})
      AND id NOT IN (9, 10)
      AND is_active = true
      LIMIT 10
    `;

    console.log("[v0] Buscando recomendações (excluindo IDs 9 e 10). Encontrados:", rows.length);
    
    return { success: true, courses: rows };
  } catch (error: any) {
    console.error("[v0] Erro ao buscar cursos recomendados:", error);
    return { success: false, error: error.message, courses: [] };
  }
}
