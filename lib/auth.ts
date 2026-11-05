import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_cooperativa_coban_2026'
)

export interface UserPayload {
  id_usuario: number
  correo: string
  nombre: string
  id_rol: number
}

// Firmar un nuevo token JWT (Expira en 8 horas)
export async function signJWT(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

// Verificar y decodificar el token JWT
export async function verifyJWT(token: string): Promise<UserPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as unknown as UserPayload
  } catch (error) {
    return null
  }
}

// Obtener el usuario autenticado desde las cookies de la petición
export async function getAuthUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  return await verifyJWT(token)
}