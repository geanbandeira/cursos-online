import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const courseId = searchParams.get('courseId');

  if (!userId || !courseId) {
    return NextResponse.json({ error: 'Faltam parâmetros' }, { status: 400 });
  }

  try {
    const orders: any = await query(
      'SELECT status FROM orders WHERE userId = ? AND courseId = ? ORDER BY id DESC LIMIT 1',
      [userId, courseId]
    );

    const isPaid = orders.length > 0 && orders[0].status === 'PAID';
    return NextResponse.json({ isPaid });
    
  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}