import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

// GET - Listar aulas de um curso
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = Number.parseInt(params.id)

    const lessons = await sql`
      SELECT 
        id, title, description, vimeo_id, vimeo_url,
        lesson_order, duration, is_preview
      FROM lessons 
      WHERE course_id = ${courseId}
      ORDER BY lesson_order ASC
    `

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Erro ao buscar aulas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
