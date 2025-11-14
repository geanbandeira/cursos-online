import { sql } from "@/lib/database"
import { NextResponse } from "next/server"

// GET - Buscar um curso específico por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = Number.parseInt(params.id)

    console.log("[v0] API: Buscando curso individual, ID:", courseId)

    const result = await sql`
      SELECT 
        id, title, description, instructor, price, original_price,
        rating, students_count, total_duration, level, image_url, category,
        pix_link, boleto_link, credit_card_link
      FROM courses 
      WHERE id = ${courseId} AND is_active = true
    `

    const courses = result.rows || result

    if (!courses || courses.length === 0) {
      console.log("[v0] API: Curso não encontrado para ID:", courseId)
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    const course = courses[0]
    console.log("[v0] API: Curso encontrado:", course.title)

    return NextResponse.json(course)
  } catch (error) {
    console.error("[v0] API: Erro ao buscar curso individual:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
