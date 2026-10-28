import { NextResponse } from "next/server";
import { query } from "@/lib/database";

function extractReferenceId(data: any): string {
  if (typeof data?.reference_id === "string") return data.reference_id;
  if (typeof data?.order?.reference_id === "string") return data.order.reference_id;
  if (typeof data?.data?.reference_id === "string") return data.data.reference_id;
  return "";
}

function extractPaymentStatus(data: any): string {
  const charges = Array.isArray(data?.charges) ? data.charges : [];
  const chargeStatuses = charges.map((charge: any) => String(charge?.status || "").toUpperCase());
  if (chargeStatuses.includes("PAID")) return "PAID";
  if (chargeStatuses.includes("AUTHORIZED")) return "AUTHORIZED";

  const candidates = [
    data?.status,
    data?.payment_status,
    data?.order?.status,
    data?.data?.status,
    data?.data?.payment_status,
  ];
  return String(candidates.find((value) => typeof value === "string") || "").toUpperCase();
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Não registre dados completos do comprador no log.
    console.log("[Webhook PagBank] Notificação recebida.");

    const referenceId = extractReferenceId(data);
    const status = extractPaymentStatus(data);

    if (!referenceId) {
      console.warn("[Webhook PagBank] Notificação sem reference_id.");
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    // Formato esperado: course_<courseId>_user_<userId>_<timestamp>
    const match = referenceId.match(/^course_(\d+)_user_(\d+)(?:_\d+)?$/);
    if (!match) {
      console.warn("[Webhook PagBank] reference_id fora do formato esperado.");
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    if (status !== "PAID") {
      // Não liberar acesso por status pendente ou apenas autorizado.
      console.log("[Webhook PagBank] Pagamento ainda não confirmado:", status || "sem status");
      return NextResponse.json({ received: true, paid: false }, { status: 200 });
    }

    const courseId = Number(match[1]);
    const userId = Number(match[2]);

    if (!Number.isSafeInteger(courseId) || !Number.isSafeInteger(userId)) {
      return NextResponse.json({ error: "Referência inválida." }, { status: 400 });
    }

    // UNIQUE(user_id, course_id) + INSERT IGNORE torna a matrícula idempotente.
    await query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId],
    );

    console.log("[Webhook PagBank] Matrícula processada:", { courseId, userId });
    return NextResponse.json({ received: true, paid: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook PagBank] Erro ao processar notificação:", error);
    return NextResponse.json({ error: "Erro interno ao processar notificação." }, { status: 500 });
  }
}
