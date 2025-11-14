"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  email: string
  name: string
  phone: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário do localStorage:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const handleSetUser = (userData: User | null) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      localStorage.removeItem("user")
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
    // Redirecionar para home
    window.location.href = "/"
  }

  const value = {
    user,
    loading,
    signOut,
    setUser: handleSetUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
