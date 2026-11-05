import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

interface Params {
  params: Promise<{ id: string }>
}

// GET: Obtener agencia por ID
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const idAgencia = parseInt(id)

    const agencia = await prisma.tb_agencias.findFirst({
      where: { id_agencia: idAgencia, is_deleted: false },
      include: {
        municipio: { include: { departamento: true } },
        serie: true,
      },
    })

    if (!agencia) {
      return NextResponse.json({ error: 'Agencia no encontrada' }, { status: 404 })
    }

    return NextResponse.json(agencia)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la agencia' }, { status: 500 })
  }
}

// PUT: Actualizar agencia (Solo Admin)
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (user.id_rol !== 1) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const idAgencia = parseInt(id)
    const body = await request.json()

    const agenciaExistente = await prisma.tb_agencias.findUnique({
      where: { id_agencia: idAgencia },
    })

    if (!agenciaExistente || agenciaExistente.is_deleted) {
      return NextResponse.json({ error: 'Agencia no encontrada' }, { status: 404 })
    }

    const agenciaActualizada = await prisma.tb_agencias.update({
      where: { id_agencia: idAgencia },
      data: {
        nombre_agencia: body.nombre_agencia,
        direccion: body.direccion,
        telefono: body.telefono,
        horario_atencion: body.horario_atencion,
        id_municipio: body.id_municipio ? parseInt(body.id_municipio) : undefined,
        id_serie: body.id_serie ? parseInt(body.id_serie) : undefined,
        estado: body.estado,
        latitud: body.latitud !== undefined ? parseFloat(body.latitud) : undefined,
        longitud: body.longitud !== undefined ? parseFloat(body.longitud) : undefined,
      },
    })

    return NextResponse.json(agenciaActualizada)
  } catch (error) {
    console.error('Error en PUT /api/agencias/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar la agencia' }, { status: 500 })
  }
}

// DELETE: Eliminación Lógica (Soft Delete) (Solo Admin)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (user.id_rol !== 1) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    const idAgencia = parseInt(id)

    // Soft Delete: marcar is_deleted = true y estado = INACTIVA
    await prisma.tb_agencias.update({
      where: { id_agencia: idAgencia },
      data: {
        is_deleted: true,
        estado: 'INACTIVA',
      },
    })

    return NextResponse.json({ message: 'Agencia eliminada exitosamente (Soft Delete)' })
  } catch (error) {
    console.error('Error en DELETE /api/agencias/[id]:', error)
    return NextResponse.json({ error: 'Error al eliminar la agencia' }, { status: 500 })
  }
}