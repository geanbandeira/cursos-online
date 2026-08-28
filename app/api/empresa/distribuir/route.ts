import { NextResponse } from "next/server";
import { query } from "@/lib/database"; // <-- Importação corrigida
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email, packageId } = await req.json();

    if (!email || !packageId) {
      return new NextResponse("E-mail e pacote obrigatórios", { status: 400 });
    }

    // 1. Valida o pacote
    const { rows: packages } = await query("SELECT * FROM b2b_packages WHERE id = ?", [packageId]);
    const b2bPackage = packages[0];

    if (!b2bPackage) return new NextResponse("Pacote não encontrado", { status: 404 });
    if (b2bPackage.usedSeats >= b2bPackage.totalSeats) return new NextResponse("Vagas esgotadas", { status: 403 });

    // 2. Verifica se o e-mail já tem licença ativa
    const { rows: activeLicenses } = await query(
      "SELECT id FROM b2b_licenses WHERE package_id = ? AND email = ? AND status = 'ACTIVE'",
      [packageId, email]
    );
    if (activeLicenses.length > 0) return new NextResponse("E-mail já possui acesso ativo", { status: 400 });

    // 3. Verifica se o usuário já existe na plataforma
    const { rows: users } = await query("SELECT id FROM users WHERE email = ?", [email]);
    const userId = users[0]?.id || null;

    // 4. Cria a licença e desconta a vaga
    await query(
      "INSERT INTO b2b_licenses (id, package_id, email, user_id) VALUES (?, ?, ?, ?)",
      [randomUUID(), packageId, email, userId]
    );
    await query("UPDATE b2b_packages SET usedSeats = usedSeats + 1 WHERE id = ?", [packageId]);

    // 5. Se o usuário já existe, matricula direto
    if (userId) {
      const { rows: enrolls } = await query(
        "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
        [userId, b2bPackage.courseId]
      );
      
      if (enrolls.length === 0) {
        await query(
          "INSERT INTO enrollments (user_id, course_id, enrolled_at, progress) VALUES (?, ?, NOW(), 0.00)",
          [userId, b2bPackage.courseId]
        );
      }
    }

    return NextResponse.json({ message: "Acesso liberado!" });
  } catch (error: any) {
    console.error("[DISTRIBUTE_ERROR]", error);
    return new NextResponse("Erro no servidor", { status: 500 });
  }
}