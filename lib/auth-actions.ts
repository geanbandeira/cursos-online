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

export async function saveUserToDatabase(email: string, name: string) {
  try {
    console.log("[v0] Iniciando salvamento no banco de dados MySQL RDS para:", email)

    // Separar primeiro e último nome
    const nameParts = name.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    console.log("[v0] Dados preparados - firstName:", firstName, "lastName:", lastName)

    const result = await query(
      `INSERT INTO users (email, first_name, last_name, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [email, firstName, lastName, 1],
    )

    console.log("[v0] Usuário salvo no banco MySQL RDS com sucesso. ID:", result.rows)
    return { success: true, data: { id: result.rows, email, firstName, lastName } }
  } catch (error: any) {
    console.log("[v0] Erro ao salvar usuário no banco MySQL RDS:", error)
    return { success: false, error: error.message }
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

export async function getUserFromToken(accessToken: string) {
  try {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    })

    const response = await client.send(command)

    // Convertendo atributos para formato mais simples
    const userAttributes: any = {}
    response.UserAttributes?.forEach((attr) => {
      if (attr.Name && attr.Value) {
        userAttributes[attr.Name] = attr.Value
      }
    })

    return {
      success: true,
      data: {
        email: userAttributes.email || "",
        name: userAttributes.name || "",
        phone: userAttributes.phone_number || "",
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
