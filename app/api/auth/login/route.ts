import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json()

    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario y su rol en la BD
    const usuario = await prisma.tb_usuarios.findUnique({
      where: { correo },
      include: { rol: true }
    })

    if (!usuario || !usuario.estado) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o usuario inactivo' },
        { status: 401 }
      )
    }

    // Verificar contraseña encriptada
    const match = await bcrypt.compare(password, usuario.password_hash)
    if (!match) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar Token JWT
    const token = await signJWT({
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      nombre: usuario.nombre,
      id_rol: usuario.id_rol
    })

    // Crear respuesta con la cookie de sesión
    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol.nombre_rol
      }
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error en POST /api/auth/login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}