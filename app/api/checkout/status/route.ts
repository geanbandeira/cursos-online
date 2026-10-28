import { NextResponse } from "next/server";
import { sql } from "@/lib/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));
  const courseId = Number(searchParams.get("courseId"));

  if (!Number.isSafeInteger(userId) || userId <= 0 || !Number.isSafeInteger(courseId) || courseId <= 0) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  try {
    // A matrícula é a fonte de verdade do acesso liberado pelo webhook.
    const enrollments = await sql`
      SELECT id
      FROM enrollments
      WHERE user_id = ${userId} AND course_id = ${courseId}
      LIMIT 1
    `;

    return NextResponse.json({ isPaid: enrollments.length > 0, enrolled: enrollments.length > 0 });
  } catch (error) {
    console.error("[Checkout Status] Erro ao verificar matrícula:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
