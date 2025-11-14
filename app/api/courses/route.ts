import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

// GET - Listar todos os cursos
export async function GET() {
  try {
    console.log("[v0] API: Iniciando busca de cursos no banco...")

    const result = await sql`
      SELECT 
        id, title, description, instructor, price, original_price,
        rating, students_count, total_duration, level, image_url, category
      FROM courses 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `

    const courses = result.rows || result

    console.log("[v0] API: Cursos encontrados no banco:", courses.length)
    console.log("[v0] API: Primeiro curso:", courses[0]?.title || "Nenhum curso")

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[v0] API: Erro ao buscar cursos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
