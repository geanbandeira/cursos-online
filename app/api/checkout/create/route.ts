import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/database";
import { getUserFromToken } from "@/lib/auth-actions";

export const runtime = "nodejs";

const PAGBANK_CHECKOUT_URL = "https://api.pagseguro.com/checkouts";
const SITE_URL = "https://cursos-online.masterproject.com.br";

function parseAmountInCents(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const token = process.env.PAGBANK_TOKEN;
    if (!token) {
      console.error("[PagBank checkout] PAGBANK_TOKEN não configurado", { requestId });
      return NextResponse.json(
        { error: "Pagamento temporariamente indisponível.", code: "PAGBANK_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    // A identidade e o preço são obtidos no servidor; não confiamos em userId/preço enviados pelo navegador.
    const accessToken = cookies().get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
    }

    const auth = await getUserFromToken(accessToken);
    if (!auth.success || !auth.data?.email) {
      return NextResponse.json({ error: "Sessão inválida. Entre novamente." }, { status: 401 });
    }

    const body = await req.json();
    const courseId = Number(body?.courseId);
    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
    }

    const userResult = await query(
      "SELECT id, email FROM users WHERE email = ? LIMIT 1",
      [auth.data.email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const courseResult = await query(
      "SELECT id, title, price FROM courses WHERE id = ? AND is_active = 1 LIMIT 1",
      [courseId]
    );
    const course = courseResult.rows[0];
    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado ou indisponível." }, { status: 404 });
    }

    const unitAmount = parseAmountInCents(course.price);
    if (!unitAmount || unitAmount > 999999900) {
      console.error("[PagBank checkout] Preço inválido no cadastro do curso", {
        requestId,
        courseId,
        price: course.price,
      });
      return NextResponse.json({ error: "Preço do curso inválido. Entre em contato com o suporte." }, { status: 500 });
    }

    const referenceId = `course_${course.id}_user_${user.id}_${Date.now()}`;
    const payload = {
      reference_id: referenceId,
      customer_modifiable: true,
      items: [
        {
          reference_id: String(course.id),
          name: String(course.title).slice(0, 100),
          quantity: 1,
          unit_amount: unitAmount,
        },
      ],
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "PIX" },
      ],
      redirect_url: `${SITE_URL}/my-courses`,
      redirect_waiting_time: 10,
      return_url: `${SITE_URL}/my-courses`,
      notification_urls: [`${SITE_URL}/api/webhook/pagbank`],
      payment_notification_urls: [`${SITE_URL}/api/webhook/pagbank`],
    };

    const response = await fetch(PAGBANK_CHECKOUT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw_response: responseText.slice(0, 1000) };
    }

    if (!response.ok) {
      // Não registrar token, dados do cartão ou dados pessoais.
      console.error("[PagBank checkout] API recusou a criação", {
        requestId,
        httpStatus: response.status,
        response: data,
        referenceId,
      });
      const apiErrors = Array.isArray(data.error_messages) ? data.error_messages : undefined;
      return NextResponse.json(
        {
          error: "O PagBank não conseguiu criar o checkout.",
          code: data.error || apiErrors?.[0]?.error || "PAGBANK_API_ERROR",
          details: apiErrors || data.description || undefined,
          requestId,
        },
        { status: response.status >= 400 && response.status < 600 ? response.status : 502 }
      );
    }

    const checkoutUrl = data.links?.find((link: any) => link.rel === "PAY")?.href;
    if (!checkoutUrl || typeof checkoutUrl !== "string") {
      console.error("[PagBank checkout] Resposta sem link PAY", {
        requestId,
        checkoutId: data.id,
        response: data,
      });
      return NextResponse.json(
        { error: "O PagBank criou uma resposta sem link de pagamento.", code: "PAGBANK_PAY_LINK_MISSING", requestId },
        { status: 502 }
      );
    }

    console.info("[PagBank checkout] Checkout criado", {
      requestId,
      checkoutId: data.id,
      referenceId,
      courseId: course.id,
      paymentMethods: ["CREDIT_CARD", "PIX"],
    });

    return NextResponse.json({ checkoutUrl, checkoutId: data.id, requestId });
  } catch (error) {
    console.error("[PagBank checkout] Erro interno", {
      requestId,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
    return NextResponse.json(
      { error: "Erro interno ao iniciar o pagamento.", code: "CHECKOUT_INTERNAL_ERROR", requestId },
      { status: 500 }
    );
  }
}
