import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log("[Webhook PagBank] Dados recebidos:", JSON.stringify(data))

    const charge = data.charges?.[0] || data
    const status = charge.status

    if (status === "PAID" || status === "AUTHORIZED") {
      const referenceId = charge.reference_id || "";
      
      // Extrai os IDs baseados na string "course_X_user_Y"
      const partes = referenceId.split('_');
      const courseId = partes[1];
      const userId = partes[3];

      if (courseId && userId) {
        await query(
          'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
          [userId, courseId]
        )
        console.log(`[Webhook] Sucesso! Usuário ${userId} matriculado no curso ${courseId}`)
      } else {
        console.warn(`[Webhook] IDs não encontrados no reference_id: ${referenceId}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[Webhook Erro]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}