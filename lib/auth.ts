import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"
import type { User } from "@prisma/client"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  return prisma.user.findUnique({
    where: { id: payload.userId },
  })
}
