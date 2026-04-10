"use server"
import crypto from "crypto"
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { query } from "./database"
import { cookies } from "next/headers";

const client = new CognitoIdentityProviderClient({
  region: "us-east-1", // Ajuste para sua região
})

const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!

function calculateSecretHash(username: string): string {
  return crypto
    .createHmac("SHA256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64")
}

// Localize a função saveUserToDatabase e adicione a parte da matrícula
export async function saveUserToDatabase(email: string, name: string) {
  try {
    const nameParts = name.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // 1. Cria o usuário
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [email, firstName, lastName, 1],
    )

    // 2. PEGA O ID DO USUÁRIO QUE ACABOU DE SER CRIADO
    // No MySQL, o ID fica em result.rows.insertId
    const newUserId = (result.rows as any).insertId;

    if (newUserId) {
      // 3. FAZ A MATRÍCULA AUTOMÁTICA
      // Troque o número 11 pelo ID real do seu curso de Aulas Abertas
      const ID_CURSO_GRATUITO = 11; 
      
      await query(
        `INSERT INTO enrollments (user_id, course_id, enrolled_at, progress) 
         VALUES (?, ?, NOW(), 0)`,
        [newUserId, ID_CURSO_GRATUITO]
      );
      
      console.log(`[v0] Matrícula automática realizada no curso ${ID_CURSO_GRATUITO} para o usuário ${newUserId}`);
    }

    return { success: true, data: { id: newUserId, email, firstName, lastName } }
  } catch (error: any) {
    console.log("[v0] Erro ao salvar usuário e matricular:", error)
    return { success: false, error: error.message }
  }
}

export async function getAllUsers(adminEmail: string) {
  try {
    // 1. Verifica permissão de admin
    const adminCheck = await query("SELECT role FROM users WHERE email = ?", [adminEmail]);
    if (!adminCheck.rows[0] || adminCheck.rows[0].role !== 'admin') {
      throw new Error("Acesso não autorizado");
    }

    // 2. Busca usuários com last_login e progresso
    const result = await query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.created_at, u.last_login, u.department, u.company_id,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'course_id', e.course_id,
              'title', c.title,
              'progress', e.progress
            )
          )
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.user_id = u.id
        ) as enrollments_data
      FROM users u 
      ORDER BY u.created_at DESC`,
      []
    );

    const users = result.rows.map(u => ({
      ...u,
      enrollments: u.enrollments_data ? (typeof u.enrollments_data === 'string' ? JSON.parse(u.enrollments_data) : u.enrollments_data) : []
    }));

    return { success: true, users };
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateLastLogin(email: string) {
  try {
    const sql = `UPDATE users SET last_login = DATE_SUB(NOW(), INTERVAL 3 HOUR) WHERE email = ?`;
    await query(sql, [email]);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao registrar acesso:", error.message);
    return { success: false };
  }
}

export async function signUpAction(email: string, password: string, name: string, phone: string) {
  try {
    console.log("[v0] Iniciando cadastro para email:", email)

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: calculateSecretHash(email),
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "phone_number", Value: phone },
      ],
    })

    const response = await client.send(command)
    console.log("[v0] Usuário criado no Cognito com sucesso")

    // Tentar salvar no banco de dados após sucesso no Cognito
    if (response) {
      console.log("[v0] Tentando salvar no banco de dados...")
      const dbResult = await saveUserToDatabase(email, name)

      if (dbResult.success) {
        console.log("[v0] Usuário salvo no banco com sucesso!")
        return {
          success: true,
          data: response,
          message: "Conta criada com sucesso! Usuário salvo no banco de dados.",
        }
      } else {
        console.log("[v0] Falha ao salvar no banco:", dbResult.error)
        return {
          success: true,
          data: response,
          message: "Conta criada no Cognito, mas houve problema ao salvar no banco de dados.",
          warning: dbResult.error,
        }
      }
    }

    return { success: true, data: response }
  } catch (error: any) {
    console.log("[v0] Erro no cadastro:", error.message)
    return { success: false, error: error.message }
  }
}


// lib/auth-actions.ts

export async function signInAction(email: string, password: string) {
  try {
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: calculateSecretHash(email),
      },
    })

    const response = await client.send(command)

    // AQUI ESTÁ O SEGREDO: Salvar o token no Cookie para o Servidor ler
    if (response.AuthenticationResult?.AccessToken) {
      const cookieStore = cookies()
      cookieStore.set("accessToken", response.AuthenticationResult.AccessToken, {
        httpOnly: true, // Segurança: impede que scripts acessem o token
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 dia
        path: "/",
      })
    }

    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function updateUserDepartment(userId: number, department: string) {
  try {
    await query(
      "UPDATE users SET department = ? WHERE id = ?",
      [department, userId]
    );
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar departamento:", error.message);
    return { success: false, error: error.message };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      SecretHash: calculateSecretHash(email),
    })

    const response = await client.send(command)
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function confirmPasswordAction(email: string, code: string, newPassword: string) {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: calculateSecretHash(email),
    })

    const response = await client.send(command)
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function confirmSignUpAction(email: string, code: string) {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: calculateSecretHash(email),
    })

    const response = await client.send(command)
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// lib/auth-actions.ts

export async function getUserFromToken(accessToken: string) {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    })

    const response = await client.send(command)

    const userAttributes: any = {}
    response.UserAttributes?.forEach((attr) => {
      if (attr.Name && attr.Value) {
        userAttributes[attr.Name] = attr.Value
      }
    })

    const email = userAttributes.email || ""

    // ALTERAÇÃO AQUI: Adicione avatar_url no SELECT
    const dbUser = await query("SELECT role, avatar_url FROM users WHERE email = ?", [email]);
    const role = dbUser.rows[0]?.role || "user";
    const avatar_url = dbUser.rows[0]?.avatar_url || ""; // Pega a foto do banco

    return {
      success: true,
      data: {
        email: email,
        name: userAttributes.name || "",
        phone: userAttributes.phone_number || "",
        role: role,
        avatar_url: avatar_url, // Agora o frontend recebe a foto no login
      },
    }
  } catch (error: any) {
    console.error("[v0] Erro ao buscar dados completos do usuário:", error.message);
    return { success: false, error: error.message }
  }
}


export async function updateUserProfile(email: string, data: { first_name?: string, avatar_url?: string }) {
  try {
    // Atualiza o nome ou a foto no banco MySQL RDS
    await query(
      "UPDATE users SET first_name = COALESCE(?, first_name), avatar_url = COALESCE(?, avatar_url), updated_at = NOW() WHERE email = ?",
      [data.first_name || null, data.avatar_url || null, email]
    )
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error.message)
    return { success: false, error: error.message }
  }
}

export async function getManagerParticipationReport(companyId: number) {
  const sql = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.department,
      COUNT(DISTINCT lp.lesson_id) as lessons_completed,
      (SELECT COUNT(*) FROM lessons l 
       JOIN enrollments e ON l.course_id = e.course_id 
       WHERE e.user_id = u.id) as total_lessons,
      MAX(lp.completed_at) as last_activity,
      u.created_at
    FROM users u
    LEFT JOIN lesson_progress lp ON u.id = lp.user_id
    WHERE u.company_id = ?
    GROUP BY u.id, u.first_name, u.last_name, u.department
  `;

  const { rows } = await query(sql, [companyId]);
  
  return rows.map(row => ({
    name: `${row.first_name} ${row.last_name}`,
    department: row.department || "Geral",
    presenceRate: row.total_lessons > 0 
      ? Math.round((row.lessons_completed / row.total_lessons) * 100) 
      : 0,
    status: getStatus(row.last_activity)
  }));
}

function getStatus(lastActivity: Date | null) {
  if (!lastActivity) return "Inativo";
  const daysSince = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 3600 * 24);
  if (daysSince < 7) return "Ativo";
  return "Em Risco";
}

// lib/auth-actions.ts

export async function registerCompanyAction(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const cnpj = formData.get("cnpj") as string;
  const managerEmail = formData.get("email") as string;

  try {
    // 1. Verificar se a empresa já existe pelo CNPJ
    const existingCompany = await query(
      "SELECT id FROM companies WHERE cnpj = ?", 
      [cnpj]
    );
    
    let companyId;

    if (existingCompany.rows.length > 0) {
      // Se a empresa já existe, pegamos o ID dela
      companyId = existingCompany.rows[0].id;
      console.log(`[v0] Empresa já cadastrada. Usando ID existente: ${companyId}`);
    } else {
      // Se não existe, criamos a nova empresa
      const companyRes = await query(
        "INSERT INTO companies (name, cnpj) VALUES (?, ?)", 
        [companyName, cnpj]
      );
      // @ts-ignore
      companyId = companyRes.rows.insertId;
      console.log(`[v0] Nova empresa cadastrada com ID: ${companyId}`);
    }

    // 2. Vincula o Gestor (Promove o usuário)
    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para garantir que o usuário 
    // receba o cargo de manager mesmo que já exista no banco.
    await query(
      `INSERT INTO users (email, company_id, role, is_active) 
       VALUES (?, ?, 'manager', 1) 
       ON DUPLICATE KEY UPDATE company_id = VALUES(company_id), role = 'manager'`,
      [managerEmail, companyId]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erro no Onboarding B2B:", error.message);
    return { success: false, error: error.message };
  }
}


// CORREÇÃO: Adicionado 'async' para cumprir a regra do Next.js
export async function generateInviteLink(companyId: number) {
  const code = Buffer.from(`company_id=${companyId}`).toString('base64');
  // Certifique-se de ter NEXT_PUBLIC_APP_URL no seu .env ou use localhost para teste
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/auth/register?invite=${code}`;
}

// lib/auth-actions.ts



// Buscar todas as empresas para o dropdown do Admin
export async function getCompanies() {
  try {
    const result = await query("SELECT id, name FROM companies ORDER BY name ASC", []);
    return { success: true, companies: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Função para o Dashboard verificar se o Gestor está logado
export async function getCurrentManager() {
  const cookieStore = cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) return null

  // Busca os dados do Cognito usando o token do cookie
  const res = await getUserFromToken(token)
  
  if (res.success && res.data.role === 'manager') {
    // Busca o company_id no banco para o dashboard saber qual empresa carregar
    const dbUser = await query("SELECT company_id FROM users WHERE email = ?", [res.data.email])
    return {
      ...res.data,
      companyId: dbUser.rows[0]?.company_id
    }
  }
  
  return null
}

// lib/auth-actions.ts

export async function addAdditionalManager(email: string, companyId: number) {
  try {
    // Verifica quantos gestores a empresa já tem
    const countRes = await query("SELECT COUNT(*) as total FROM users WHERE company_id = ? AND role = 'manager'", [companyId]);
    
    if (countRes.rows[0].total >= 3) {
      return { success: false, error: "Limite de 3 gestores atingido para esta empresa." };
    }

    await query(
      "UPDATE users SET company_id = ?, role = 'manager' WHERE email = ?",
      [companyId, email]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// lib/auth-actions.ts
export async function getCompanyManagers(companyId: number) {
  try {
    const res = await query(
      "SELECT id, first_name, email FROM users WHERE company_id = ? AND role = 'manager' LIMIT 3",
      [companyId]
    );
    return { success: true, managers: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// lib/auth-actions.ts

// 1. Criar Empresa (Garante que o nome não seja duplicado)
export async function createCompanyAction(name: string) {
  try {
    await query("INSERT INTO companies (name) VALUES (?)", [name.toUpperCase()]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Empresa já cadastrada ou erro no banco." };
  }
}

// lib/auth-actions.ts

export async function createCompanyWithManagers(name: string, managers: {name: string, email: string}[]) {
  try {
    // 1. Executa o Insert
    const res = await query("INSERT INTO companies (name) VALUES (?)", [name.toUpperCase()]);
    
    // DEBUG: Se der erro de novo, olhe o terminal do VS Code para ver este log
    console.log("Resposta do Banco:", res);

    // 2. Tenta capturar o ID de todas as formas conhecidas (MySQL, MariaDB, etc)
    let companyId = null;

    if (res.insertId) companyId = res.insertId;
    else if (res[0]?.insertId) companyId = res[0].insertId;
    else if (res.rows?.[0]?.id) companyId = res.rows[0].id; // Para PostgreSQL
    else if (res.rows?.insertId) companyId = res.rows.insertId;

    if (!companyId) {
      // Fallback 2026: Busca o ID pelo nome se o insertId falhar
      const findId = await query("SELECT id FROM companies WHERE name = ? ORDER BY id DESC LIMIT 1", [name.toUpperCase()]);
      companyId = findId.rows?.[0]?.id || findId?.[0]?.id;
    }

    if (!companyId) throw new Error("Não foi possível recuperar o ID da empresa criada.");

    // 3. Processa os gestores
    for (const m of managers) {
      if (m.email && m.email.trim() !== "") {
        await query(
          "UPDATE users SET company_id = ?, role = 'manager', first_name = ? WHERE email = ?",
          [Number(companyId), m.name || "Gestor", m.email.trim()]
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro Onboarding:", error.message);
    return { success: false, error: error.message };
  }
}

export async function linkStudentToCompany(userId: number, companyId: number | null) {
  try {
    // Força o ID a ser número ou nulo
    const cId = companyId === null ? null : Number(companyId);
    const uId = Number(userId);
    await query("UPDATE users SET company_id = ? WHERE id = ?", [cId, uId]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
// 3. Promover a Gestor (Usa o e-mail para buscar no Cognito/Banco)
export async function addCompanyManager(email: string, companyId: number) {
  try {
    // Verifica se já tem 3
    const check = await query("SELECT COUNT(*) as total FROM users WHERE company_id = ? AND role = 'manager'", [companyId]);
    if (check.rows[0].total >= 3) return { success: false, error: "Limite de 3 gestores atingido." };

    await query("UPDATE users SET role = 'manager', company_id = ? WHERE email = ?", [companyId, email]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeManagerRole(userId: number) {
  try {
    await query("UPDATE users SET role = 'student' WHERE id = ?", [userId]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


// Busca empresas e já traz quem são os gestores vinculados
export async function getCompaniesWithManagers() {
  try {
    const sql = `
      SELECT c.*, 
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', first_name, 'email', email))
       FROM users WHERE company_id = c.id AND role = 'manager') as managers
      FROM companies c
    `;
    const { rows } = await query(sql);
    return { success: true, companies: rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Deleta empresa
export async function deleteCompanyAction(id: number) {
  try {
    await query("DELETE FROM companies WHERE id = ?", [id]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}