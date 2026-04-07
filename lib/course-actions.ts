"use server"

import { sql } from "@/lib/database"
import { query } from "./database"; // Verifique se este import já existe no topo


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

export async function issueCertificateAction(data: {
  userId: number;
  courseId: number;
  certificateCode: string;
  pdfUrl: string;
  imageUrl: string;
}) {
  try {
    // Busca o título do curso primeiro
    const courses = await sql`SELECT title FROM courses WHERE id = ${data.courseId}`;
    const courseName = courses[0]?.title || "Curso Concluído";

    // O uso de ${} na função sql que você possui já trata os parâmetros
    // mas se algum valor de 'data' for undefined, o erro acontece aqui.
    await sql`
      INSERT INTO certificates 
      (user_id, course_id, course_name_at_issue, pdf_url, image_url, certificate_code, issue_date)
      VALUES 
      (${data.userId}, ${data.courseId}, ${courseName}, ${data.pdfUrl}, ${data.imageUrl}, ${data.certificateCode}, NOW())
    `;
    
    return { success: true };
  } catch (error: any) {
    console.error("Erro na query de certificado:", error);
    return { success: false, error: error.message };
  }
}

// lib/course-actions.ts

export async function getMyCertificatesAction(userId: string) {
  try {
    console.log("[v0] Buscando certificados para o aluno:", userId);
    
    // Busca os certificados vinculados ao ID do aluno logado
    const result = await sql`
      SELECT cert.*, c.title as course_title 
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.user_id = ${Number.parseInt(userId)}
      ORDER BY cert.issue_date DESC
    `;
    
    return { success: true, certificates: result };
  } catch (error: any) {
    console.error("[v0] Erro ao buscar certificados do aluno:", error);
    return { success: false, certificates: [], error: error.message };
  }
}

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

// lib/course-actions.ts

export async function getAllEnrolledMaterials(userId: string) {
  try {
    console.log("[v0] Buscando TODOS os materiais para o usuário:", userId);
    
    // Busca materiais de todos os cursos onde o usuário tem matrícula
    const result = await sql`
      SELECT 
        cm.id, 
        cm.title, 
        cm.file_url, 
        cm.file_type, 
        cm.file_size, 
        c.title as course_name,
        c.id as course_id
      FROM course_materials cm
      INNER JOIN enrollments e ON cm.course_id = e.course_id
      INNER JOIN courses c ON cm.course_id = c.id
      WHERE e.user_id = ${Number.parseInt(userId)}
      ORDER BY c.title ASC, cm.id DESC
    `;
    
    return { success: true, materials: result };
  } catch (error: any) {
    console.error("[v0] Erro ao buscar todos os materiais:", error);
    return { success: false, materials: [], error: error.message };
  }
}

// Busca usuários com detalhes de matrícula e progresso para o Admin
export async function getAdminUsersDetailedAction() {
  try {
    const users = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.created_at,
      (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'course_id', e.course_id,
            'title', c.title,
            'progress', e.progress,
            'enrolled_at', e.enrolled_at
          )
        )
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = u.id
      ) as enrollments
      FROM users u
      ORDER BY u.created_at DESC
    `;
    
    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Busca os certificados de um usuário específico
export async function getUserCertificatesAction(userId: number) {
  try {
    const result = await sql`
      SELECT cert.*, c.title as course_title 
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.user_id = ${userId}
    `;
    return { success: true, certificates: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getManagerParticipationReport(companyId: number) {
  const sql = `
    SELECT 
      u.id,
      CONCAT(u.first_name, ' ', u.last_name) as name,
      u.department,
      COUNT(DISTINCT DATE(lp.completed_at)) as days_present,
      DATEDIFF(CURRENT_DATE, DATE(u.created_at)) as days_since_joined,
      COUNT(DISTINCT lp.lesson_id) as lessons_completed,
      (SELECT COUNT(*) FROM lessons l 
       JOIN enrollments e ON l.course_id = e.course_id 
       WHERE e.user_id = u.id) as total_lessons
    FROM users u
    LEFT JOIN lesson_progress lp ON u.id = lp.user_id
    WHERE u.company_id = ?
    GROUP BY u.id, u.first_name, u.last_name, u.department, u.created_at
  `;

  const { rows } = await query(sql, [companyId]);

  return rows.map((row: any) => {
    const presence = row.days_present || 0;
    // Dias ausentes = dias totais desde o cadastro - dias que acessou
    const absent = Math.max(0, row.days_since_joined - presence);
    const progress = row.total_lessons > 0 
      ? Math.round((row.lessons_completed / row.total_lessons) * 100) 
      : 0;

    return {
      ...row,
      days_present: presence,
      days_absent: absent,
      presenceRate: progress,
      status: progress > 70 ? "Alta Performance" : progress > 30 ? "Em Progresso" : "Alerta"
    };
  });
}

export async function getDailyCompletionTrend(companyId: number) {
  const sql = `
    SELECT 
      DATE(lp.completed_at) as date,
      COUNT(lp.id) as completions
    FROM lesson_progress lp
    JOIN users u ON lp.user_id = u.id
    WHERE u.company_id = ? 
    AND lp.completed_at IS NOT NULL -- Alterado de lp.completed = true
    AND lp.completed_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY DATE(lp.completed_at)
    ORDER BY date ASC
  `;
  
  const { rows } = await query(sql, [companyId]);
  return rows;
}

// lib/course-actions.ts

export async function getActivationByDepartment(companyId: number) {
  const sql = `
    SELECT 
      u.department,
      COUNT(u.id) as total_users,
      -- Conta quantos usuários têm pelo menos um registro de progresso
      COUNT(DISTINCT lp.user_id) as activated_users
    FROM users u
    LEFT JOIN lesson_progress lp ON u.id = lp.user_id
    WHERE u.company_id = ?
    GROUP BY u.department
  `;
  
  const { rows } = await query(sql, [companyId]);
  
  return rows.map((row: any) => ({
    department: row.department || "Não Definido",
    activationRate: row.total_users > 0 
      ? Math.round((row.activated_users / row.total_users) * 100) 
      : 0,
    total: row.total_users,
    activated: row.activated_users
  }));
}


export async function getCompanyQuizPerformance(companyId: number) {
  const sql = `
    SELECT 
      qa.category,
      AVG(qa.score) as avg_score,
      COUNT(qa.id) as total_attempts,
      -- Comparativo: Média de quem fez após aula AO VIVO vs GRAVADA
      AVG(CASE WHEN qa.is_after_live_session = 1 THEN qa.score END) as live_score,
      AVG(CASE WHEN qa.is_after_live_session = 0 THEN qa.score END) as recorded_score
    FROM quiz_attempts qa
    JOIN users u ON qa.user_id = u.id
    WHERE u.company_id = ?
    GROUP BY qa.category
  `;

  const { rows } = await query(sql, [companyId]);
  return rows;
}

// lib/course-actions.ts
export async function getCompanyCompetencyMap(companyId: number) {
  const sql = `
    SELECT 
      qa.category,
      AVG(qa.score) as avg_score,
      COUNT(qa.id) as total_tests,
      MAX(qa.score) as top_score
    FROM quiz_attempts qa
    JOIN users u ON qa.user_id = u.id
    WHERE u.company_id = ?
    GROUP BY qa.category
  `;
  const { rows } = await query(sql, [companyId]);
  return rows;
}

export async function getCompanyTechnicalStats(companyId: number) {
  try {
    const cId = Number(companyId);

    // 1. Ranking por Setor: Pega a média de progresso de todos os alunos da empresa
    const rankingQuery = `
      SELECT 
        COALESCE(NULLIF(u.department, ''), 'Geral') as department, 
        ROUND(AVG(COALESCE(e.progress, 0)), 1) as avg_score,
        COUNT(DISTINCT u.id) as total_students
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      WHERE u.company_id = ?
      GROUP BY COALESCE(NULLIF(u.department, ''), 'Geral')
      ORDER BY avg_score DESC
    `;

    // 2. Talentos: Os 3 alunos com maior média de progresso individual
    const talentsQuery = `
      SELECT 
        u.first_name, 
        u.last_name, 
        u.email, 
        COALESCE(NULLIF(u.department, ''), 'Geral') as department,
        ROUND(AVG(COALESCE(e.progress, 0)), 1) as avg_score
      FROM users u
      INNER JOIN enrollments e ON u.id = e.user_id
      WHERE u.company_id = ?
      GROUP BY u.id
      ORDER BY avg_score DESC
      LIMIT 3
    `;

    const [rankingRes, talentsRes] = await Promise.all([
      query(rankingQuery, [cId]),
      query(talentsQuery, [cId])
    ]);

    return {
      success: true,
      ranking: rankingRes.rows || [],
      talents: talentsRes.rows || []
    };
  } catch (error: any) {
    console.error("Erro SQL Stats:", error.message);
    return { success: false, error: error.message };
  }
}