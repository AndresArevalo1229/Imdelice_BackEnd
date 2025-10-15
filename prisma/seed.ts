// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const PERMS = [
  // Usuarios
  'users.read','users.create','users.update','users.delete',
  // Roles
  'roles.read','roles.create','roles.update','roles.delete',
  // Categorías
  'categories.read','categories.create','categories.update','categories.delete',
  // Modificadores
  'modifiers.read','modifiers.create','modifiers.update','modifiers.delete',
  // Menú
  'menu.update'
]

async function main() {
  // upsert permisos
  for (const code of PERMS) {
    await prisma.permission.upsert({
      where: { code }, update: {},
      create: { code, name: code.toUpperCase() }
    })
  }

  // Rol ADMIN con todos
  const admin = await prisma.role.upsert({
    where: { name: 'admin-' },
    update: {},
    create: { name: 'ADMIN', description: 'Acceso total' }
  })
  const allPerms = await prisma.permission.findMany()
  await prisma.rolePermission.deleteMany({ where: { roleId: admin.id }})
  await prisma.rolePermission.createMany({
    data: allPerms.map(p => ({ roleId: admin.id, permissionId: p.id })),
    skipDuplicates: true
  })

  // Rol MESERO con lo mínimo
  const mesero = await prisma.role.upsert({
    where: { name: 'MESERO' },
    update: {},
    create: { name: 'MESERO', description: 'Operación en piso' }
  })
  const meseroPerms = await prisma.permission.findMany({
    where: { code: { in: [
      'categories.read',
      'modifiers.read',
      // si la app de mesero edita menú, agrega 'menu.update'; si no, quítalo
    ]}}
  })
  await prisma.rolePermission.deleteMany({ where: { roleId: mesero.id }})
  await prisma.rolePermission.createMany({
    data: meseroPerms.map(p => ({ roleId: mesero.id, permissionId: p.id })),
    skipDuplicates: true
  })
}

main().finally(()=> prisma.$disconnect())
