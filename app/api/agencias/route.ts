import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET: Obtener todas las agencias no eliminadas (Filtros por nombre, código y municipio)
export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const municipioId = searchParams.get('id_municipio')

    const agencias = await prisma.tb_agencias.findMany({
      where: {
        is_deleted: false,
        AND: [
          search
            ? {
                OR: [
                  { nombre_agencia: { contains: search, mode: 'insensitive' } },
                  { direccion: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          municipioId ? { id_municipio: parseInt(municipioId) } : {},
        ],
      },
      include: {
        municipio: {
          include: {
            departamento: true,
          },
        },
        serie: true,
      },
      orderBy: { id_agencia: 'desc' },
    })

    return NextResponse.json(agencias)
  } catch (error) {
    console.error('Error en GET /api/agencias:', error)
    return NextResponse.json({ error: 'Error al obtener agencias' }, { status: 500 })
  }
}

// POST: Crear una nueva agencia (Solo Admin - Rol 1)
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (user.id_rol !== 1) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de Administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      nombre_agencia,
      codigo_agencia,
      direccion,
      telefono,
      horario_atencion,
      id_municipio,
      id_serie,
      latitud,
      longitud,
    } = body

    // Validación básica de campos requeridos
    if (!nombre_agencia || !codigo_agencia || !direccion || !telefono || !horario_atencion || !id_municipio || !id_serie) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser proporcionados' },
        { status: 400 }
      )
    }

    // Verificar unicidad del código de agencia
    const existeCodigo = await prisma.tb_agencias.findUnique({
      where: { codigo_agencia: parseInt(codigo_agencia) },
    })

    if (existeCodigo) {
      return NextResponse.json(
        { error: 'El código de agencia ya existe' },
        { status: 400 }
      )
    }

    const nuevaAgencia = await prisma.tb_agencias.create({
      data: {
        nombre_agencia,
        codigo_agencia: parseInt(codigo_agencia),
        direccion,
        telefono,
        horario_atencion,
        id_municipio: parseInt(id_municipio),
        id_serie: parseInt(id_serie),
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null,
      },
      include: {
        municipio: true,
        serie: true,
      },
    })

    return NextResponse.json(nuevaAgencia, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/agencias:', error)
    return NextResponse.json({ error: 'Error al crear la agencia' }, { status: 500 })
  }
}