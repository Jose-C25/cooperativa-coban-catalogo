import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const [departamentos, municipios, series] = await Promise.all([
      prisma.tb_departamentos.findMany(),
      prisma.tb_municipios.findMany({ include: { departamento: true } }),
      prisma.tb_series.findMany(),
    ])

    return NextResponse.json({
      departamentos,
      municipios,
      series,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener catálogos' }, { status: 500 })
  }
}