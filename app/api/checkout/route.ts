import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, courseId, customer, item } = await request.json();

    const response = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAGBANK_TOKEN}`
      },
      body: JSON.stringify({
        // A referência é crucial para identificar o pagamento no Webhook
        reference_id: `$course_${courseId}_user_${userId}_${Date.now()}`,
        customer: {
          name: customer.name,
          email: customer.email,
          tax_id: customer.tax_id
        },
        items: [{
          name: item.name,
          quantity: 1,
          unit_amount: item.price // Valor em centavos (ex: 5000 para R$50,00)
        }],
        qr_codes: [{
          amount: { value: item.price }
        }],
        notification_urls: [
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pagbank`
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Erro no checkout' }, { status: 500 });
  }
}