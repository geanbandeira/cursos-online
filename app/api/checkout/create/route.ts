import { NextResponse } from "next/server";
import { sql } from "@/lib/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cursos-online.masterproject.com.br";

export async function POST(req: Request) {
  try {
    const token = process.env.PAGBANK_TOKEN;
    if (!token) {
      console.error("[Checkout] PAGBANK_TOKEN não configurado.");
      return NextResponse.json({ error: "Pagamento não configurado no servidor." }, { status: 500 });
    }

    const body = await req.json();
    const courseId = Number(body.courseId);
    const userId = Number(body.userId);

    if (!Number.isSafeInteger(courseId) || courseId <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Curso ou usuário inválido." }, { status: 400 });
    }

    // O preço e o título vêm do banco; não confiamos nos valores enviados pelo navegador.
    const courses = await sql`
      SELECT id, title, price
      FROM courses
      WHERE id = ${courseId} AND is_active = true
      LIMIT 1
    `;

    if (!courses.length) {
      return NextResponse.json({ error: "Curso não encontrado ou inativo." }, { status: 404 });
    }

    const course = courses[0] as { id: number; title: string; price: number | string };
    const priceInCents = Math.round(Number(course.price) * 100);

    if (!Number.isSafeInteger(priceInCents) || priceInCents <= 0) {
      console.error("[Checkout] Preço inválido para o curso:", courseId);
      return NextResponse.json({ error: "O preço deste curso está inválido." }, { status: 500 });
    }

    // Referência estável para o webhook identificar a matrícula.
    const referenceId = `course_${courseId}_user_${userId}_${Date.now()}`;
    const webhookUrl = `${APP_URL}/api/webhook/pagbank`;

    const payload = {
      reference_id: referenceId,
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          name: String(course.title).slice(0, 100),
          quantity: 1,
          unit_amount: priceInCents,
        },
      ],
      payment_methods: [{ type: "CREDIT_CARD" }, { type: "PIX" }],
      redirect_url: `${APP_URL}/my-courses`,
      return_url: `${APP_URL}/my-courses`,
      notification_urls: [webhookUrl],
      payment_notification_urls: [webhookUrl],
    };

    const response = await fetch("https://api.pagseguro.com/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[PagBank Erro API]:", JSON.stringify(data));
      return NextResponse.json(
        { error: "O PagBank não conseguiu criar o checkout.", details: data },
        { status: response.status >= 400 && response.status < 600 ? response.status : 502 },
      );
    }

    const checkoutUrl = data.links?.find((link: { rel: string; href: string }) => link.rel === "PAY")?.href;

    if (!checkoutUrl) {
      console.error("[Checkout] PagBank não retornou link PAY:", JSON.stringify(data));
      return NextResponse.json({ error: "O PagBank não retornou o link de pagamento." }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl, referenceId });
  } catch (error) {
    console.error("[Checkout Erro]:", error);
    return NextResponse.json({ error: "Erro ao gerar checkout." }, { status: 500 });
  }
}
