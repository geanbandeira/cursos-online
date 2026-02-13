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

    // 2. Busca usuários com seus cursos e progressos agrupados
    const result = await query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.created_at,
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

    // Formata o resultado para o frontend
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
    return { success: true, data: response }
  } catch (error: any) {
    return { success: false, error: error.message }
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

    // NOVO: Busca o cargo (role) no MySQL RDS usando o email do Cognito
    const dbUser = await query("SELECT role FROM users WHERE email = ?", [email]);
    const role = dbUser.rows[0]?.role || "user";

    return {
      success: true,
      data: {
        email: email,
        name: userAttributes.name || "",
        phone: userAttributes.phone_number || "",
        role: role, // Agora o frontend saberá se você é admin
      },
    }
  } catch (error: any) {
    console.error("[v0] Erro ao buscar dados completos do usuário:", error.message);
    return { success: false, error: error.message }
  }
}
