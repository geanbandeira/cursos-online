// Script para debugar os dados das aulas e identificar o problema do contador

async function debugLessons() {
  try {
    console.log("[DEBUG] Iniciando debug das aulas...")

    // Testar a API diretamente
    const response = await fetch("http://localhost:3000/api/courses/1/lessons")
    const data = await response.json()

    console.log("[DEBUG] Resposta da API:", data)
    console.log("[DEBUG] Número de aulas:", data.lessons?.length)

    if (data.lessons) {
      data.lessons.forEach((lesson, index) => {
        console.log(`[DEBUG] Aula ${index + 1}:`)
        console.log(`  - ID: ${lesson.id} (tipo: ${typeof lesson.id})`)
        console.log(`  - lesson_order: ${lesson.lesson_order} (tipo: ${typeof lesson.lesson_order})`)
        console.log(`  - lesson_order convertido: ${Number(lesson.lesson_order)}`)
        console.log(`  - título: ${lesson.title}`)
        console.log("---")
      })
    }

    // Testar conversões
    console.log("[DEBUG] Testando conversões:")
    const testValues = ["1", "2", "3", 1, 2, 3]
    testValues.forEach((val) => {
      console.log(`  - Valor: ${val} (tipo: ${typeof val}) -> Number(): ${Number(val)}`)
    })
  } catch (error) {
    console.error("[DEBUG] Erro:", error)
  }
}

// Executar o debug
debugLessons()
