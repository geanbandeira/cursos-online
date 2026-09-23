import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Ajuste conforme o caminho do seu cliente de banco

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const charge = body.charges?.[0];

    if (!charge) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const { status, reference_id } = charge; // Esperado em reference_id: "userId_courseId"

    if (status === 'PAID' && reference_id) {
      const [userId, courseId] = reference_id.split('_');

      if (userId && courseId) {
        // Evita duplicidade de matrícula
        const existing = await db.enrollment.findFirst({
          where: { userId, courseId },
        });

        if (!existing) {
          await db.enrollment.create({
            data: {
              userId,
              courseId,
              status: 'ACTIVE',
              paidAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook do PagBank:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}