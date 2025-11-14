import { sql } from "../lib/database"

async function checkDatabase() {
  try {
    console.log("[v0] Verificando conexão com banco...")

    // Verificar todos os cursos
    const courses = await sql`SELECT id, title, description, price, image_url FROM courses ORDER BY id`

    console.log("[v0] Total de cursos encontrados:", courses.length)

    courses.forEach((course, index) => {
      console.log(`[v0] Curso ${index + 1}:`, {
        id: course.id,
        title: course.title,
        price: course.price,
      })
    })

    // Procurar especificamente pelo curso alterado
    const testCourse = await sql`SELECT * FROM courses WHERE title LIKE '%Teste%'`
    console.log('[v0] Cursos com "Teste" no nome:', testCourse.length)

    if (testCourse.length > 0) {
      console.log("[v0] Curso encontrado:", testCourse[0])
    }
  } catch (error) {
    console.error("[v0] Erro ao verificar banco:", error)
  }
}

checkDatabase()
