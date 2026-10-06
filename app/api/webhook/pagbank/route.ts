import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log("[Webhook PagBank] Dados recebidos:", JSON.stringify(data))

    const charge = data.charges?.[0] || data
    const status = charge.status

    if (status === "PAID" || status === "AUTHORIZED") {
      const courseId = charge.reference_id || charge.metadata?.course_id
      const customerEmail = charge.customer?.email || charge.payer?.email

      if (courseId && customerEmail) {
        const userResult = await query(
          'SELECT id FROM users WHERE email = ? OR email = ?', 
          [customerEmail, customerEmail.toLowerCase()]
        )

        const dbUser = Array.isArray(userResult) ? userResult[0] : userResult?.rows?.[0]

        if (dbUser) {
          // Removido o created_at e adicionado INSERT IGNORE
          await query(
            'INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)',
            [dbUser.id, courseId]
          )
          console.log(`[Webhook] Sucesso! Usuário ${dbUser.id} matriculado no curso ${courseId}`)
        } else {
          console.warn(`[Webhook] Usuário com email ${customerEmail} não encontrado.`)
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[Webhook Erro]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}