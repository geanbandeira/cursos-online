import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, courseId, customer, item } = await req.json();

    const response = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        reference_id: `${userId}_${courseId}`,
        customer,
        items: [item],
        qr_codes: [{ amount: { value: item.unit_amount } }],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}