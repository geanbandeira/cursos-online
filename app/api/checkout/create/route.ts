import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { userId, courseId } = await req.json();

    const users: any = await query('SELECT name, email, cpf FROM users WHERE id = ?', [userId]);
    const courses: any = await query('SELECT title, price FROM courses WHERE id = ?', [courseId]);

    if (!users.length || !courses.length) {
      return NextResponse.json({ error: 'Utilizador ou curso não encontrado' }, { status: 404 });
    }

    const user = users[0];
    const course = courses[0];
    const referenceId = `ped_${userId}_${courseId}_${Date.now()}`;
    const amountInCents = Math.round(parseFloat(course.price) * 100);

    const pagbankRes = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_id: referenceId,
        customer: {
          name: user.name,
          email: user.email,
          tax_id: user.cpf 
        },
        items: [{ name: course.title, quantity: 1, unit_amount: amountInCents }],
        qr_codes: [{ amount: { value: amountInCents } }],
        notification_urls: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`]
      })
    });

    const data = await pagbankRes.json();
    if (!pagbankRes.ok) throw new Error(JSON.stringify(data));

    await query(
      'INSERT INTO orders (referenceId, userId, courseId, status, pagbankOrderId) VALUES (?, ?, ?, ?, ?)',
      [referenceId, userId, courseId, 'PENDING', data.id]
    );

    const qrCode = data.qr_codes[0];
    return NextResponse.json({ 
      qrCodeImage: qrCode.links.find((l: any) => l.media === 'image/png').href,
      pixCopiaECola: qrCode.text 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}