import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as jose from 'jose'

export async function GET() {
  const cookieStore = await cookies() 
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ rol: 'Consulta' })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secreto_super_seguro_123')
    const { payload } = await jose.jwtVerify(token, secret)
    
    // Traducimos el id_rol que ya tienes en tu token a texto.
    // Asegúrate de que el número 1 corresponda a Administrador en tu base de datos.
    const nombreRol = payload.id_rol === 1 ? 'Administrador' : 'Consulta'
    
    return NextResponse.json({ rol: nombreRol })
  } catch (error) {
    return NextResponse.json({ rol: 'Consulta' })
  }
}