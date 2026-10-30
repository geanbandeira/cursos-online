import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { courseId, title, price, userId } = await req.json();

    const pagBankPayload = {
      reference_id: `course_${courseId}_user_${userId}`, 
      items: [
        {
          name: title,
          quantity: 1,
          unit_amount: Math.round(price * 100)
        }
      ],
      notification_urls: [
        "https://cursos-online.masterproject.com.br/api/webhook/pagbank"
      ],
      // CORREÇÃO: redirect_url tem que ficar dentro do objeto "checkout"
      checkout: {
        expires_in: 1440, // 24 horas para o link expirar
        redirect_url: "https://cursos-online.masterproject.com.br/my-courses"
      }
    };

    const response = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAGBANK_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pagBankPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[PagBank Erro API]:", data);
      return NextResponse.json({ error: "Erro na resposta do PagBank", details: data }, { status: response.status });
    }

    const checkoutUrl = data.links?.find((link: any) => link.rel === 'PAY')?.href;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("[Checkout Erro]:", error);
    return NextResponse.json({ error: "Erro ao gerar checkout" }, { status: 500 });
  }
}