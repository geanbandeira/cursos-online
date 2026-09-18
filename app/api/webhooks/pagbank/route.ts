import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // O formato exato depende do payload do PagBank
    // Geralmente status 'PAID' ou '3' indica sucesso
    if (data.status === 'PAID') {
      const email = data.customer.email;
      
      // Lógica do banco de dados para liberar acesso ao aluno
      console.log(`Acesso liberado para: ${email}`);
    }

    // Retorne 200 rapidamente para o PagBank não reenviar a notificação
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}