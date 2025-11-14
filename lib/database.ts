import mysql from "mysql2/promise"

console.log("[v0] Database: Configurando conexão com AWS RDS MySQL...")

// Pool de conexões MySQL otimizado para serverless
const pool = mysql.createPool({
  host: "master-project-courses.cyd6a20so0aq.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "RPPdK9iRD131",
  database: "master",
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function query(sql: string, params: any[] = []) {
  try {
    console.log("[v0] Database: Executando query no AWS RDS MySQL:", sql)
    const [rows] = await pool.execute(sql, params)
    console.log("[v0] Database: Query executada com sucesso, rows:", Array.isArray(rows) ? rows.length : 1)

    return {
      rows: rows as any[],
      rowCount: Array.isArray(rows) ? rows.length : 1,
    }
  } catch (error) {
    console.error("[v0] Database: Erro na query:", error)
    throw error
  }
}

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  try {
    // Converter template literal para query MySQL com placeholders
    let sqlQuery = strings[0]
    const params: any[] = []

    for (let i = 0; i < values.length; i++) {
      sqlQuery += "?" + strings[i + 1]
      params.push(values[i])
    }

    console.log("[v0] Database: Executando query no AWS RDS MySQL:", sqlQuery)
    const [rows] = await pool.execute(sqlQuery, params)
    console.log("[v0] Database: Query executada com sucesso, rows:", Array.isArray(rows) ? rows.length : 1)

    // Retornar no formato esperado pelas APIs
    return Array.isArray(rows) ? rows : [rows]
  } catch (error) {
    console.error("[v0] Database: Erro na query:", error)
    throw error
  }
}

// Função para fechar o pool (útil para testes)
export async function closePool() {
  await pool.end()
}

// Tipos TypeScript para as tabelas
export interface Course {
  id: number
  title: string
  description: string
  instructor: string
  price: string
  original_price?: string
  rating: number
  students_count: number
  total_duration: string
  level: string
  image_url?: string
  category?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Lesson {
  id: number
  course_id: number
  title: string
  description?: string
  vimeo_id: string
  vimeo_url?: string
  lesson_order: number
  duration?: string
  is_preview: boolean
  created_at: Date
}

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  enrolled_at: Date
  completed_at?: Date
  progress: number
}
