import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando la siembra de datos...')

  // 1. Crear Roles Base
  const rolAdmin = await prisma.tb_roles.upsert({
    where: { id_rol: 1 },
    update: {},
    create: { nombre_rol: 'Administrador' },
  })

  const rolConsulta = await prisma.tb_roles.upsert({
    where: { id_rol: 2 },
    update: {},
    create: { nombre_rol: 'Consulta' },
  })

  console.log('✓ Roles creados')

  // 2. Crear Departamento Base
  const deptoAltaVerapaz = await prisma.tb_departamentos.upsert({
    where: { id_departamento: 1 },
    update: {},
    create: { nombre_departamento: 'Alta Verapaz' },
  })

  console.log('✓ Departamento creado: Alta Verapaz')

  // 3. Crear Municipios
  const municipios = [
    'Cobán',
    'San Pedro Carchá',
    'San Juan Chamelco',
    'Chisec',
    'Tactic',
    'Santa Cruz Verapaz'
  ]

  for (const nombre of municipios) {
    const existe = await prisma.tb_municipios.findFirst({
      where: { nombre_municipio: nombre }
    })
    if (!existe) {
      await prisma.tb_municipios.create({
        data: {
          nombre_municipio: nombre,
          id_departamento: deptoAltaVerapaz.id_departamento,
        },
      })
    }
  }

  console.log('✓ Municipios creados')

  // 4. Crear Series Base
  const series = ['A', 'B', 'C']
  for (const letra of series) {
    const existe = await prisma.tb_series.findFirst({
      where: { letra_serie: letra }
    })
    if (!existe) {
      await prisma.tb_series.create({
        data: { letra_serie: letra },
      })
    }
  }

  console.log('✓ Series creadas')

  // 5. Crear Usuarios Iniciales
  const passwordAdmin = await bcrypt.hash('admin123', 10)
  const passwordConsulta = await bcrypt.hash('consulta123', 10)

  await prisma.tb_usuarios.upsert({
    where: { correo: 'admin@cooperativacoban.com.gt' },
    update: {},
    create: {
      nombre: 'Administrador General',
      correo: 'admin@cooperativacoban.com.gt',
      password_hash: passwordAdmin,
      id_rol: rolAdmin.id_rol,
      estado: true,
    },
  })

  await prisma.tb_usuarios.upsert({
    where: { correo: 'lector@cooperativacoban.com.gt' },
    update: {},
    create: {
      nombre: 'Usuario Consulta',
      correo: 'lector@cooperativacoban.com.gt',
      password_hash: passwordConsulta,
      id_rol: rolConsulta.id_rol,
      estado: true,
    },
  })

  console.log('✓ Usuarios iniciales creados:')
  console.log('  - Admin: admin@cooperativacoban.com.gt / admin123')
  console.log('  - Consulta: lector@cooperativacoban.com.gt / consulta123')

  console.log('¡Seed completado con éxito!')
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })