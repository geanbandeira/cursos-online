import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const referenceId = body.reference_id;
    const chargeStatus = body.charges?.[0]?.status;

    if (!referenceId) return NextResponse.json({ error: 'Sem reference_id' }, { status: 400 });

    if (chargeStatus === 'PAID') {
      await query('UPDATE orders SET status = ? WHERE referenceId = ?', ['PAID', referenceId]);

      const orders: any = await query('SELECT userId, courseId FROM orders WHERE referenceId = ?', [referenceId]);
      
      if (orders.length > 0) {
        const order = orders[0];
        await query(
          'INSERT INTO enrollments (userId, courseId, active) VALUES (?, ?, ?)',
          [order.userId, order.courseId, 1]
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Erro no Webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}