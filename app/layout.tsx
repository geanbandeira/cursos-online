import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Master Project - Plataforma de Cursos",
  description: "Cursos de Análise de Negócio - BPM, BPMN com Bizagi, Jira Software - Gestão Ágil de Projetos e Operações, Gerenciamento de Projetos PMI - Iniciação ao Planejamento, Gerenciamento de Projetos PMI - Planejamento Avançado, Gerenciamento de Projetos PMI - Execução, Monitoramento e Controle, Dominando OKR. Plataforma de ensino online especializada em desenvolvimento profissional",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="icon" href="/logonave.webp"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Google Analytics ATUALIZADO */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-96NDN2WK6J"></script>
        <script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-96NDN2WK6J');
          `}
        </script>
      </head>
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}