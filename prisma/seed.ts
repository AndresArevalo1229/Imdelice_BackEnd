import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const PERMS = [
  'users.read','users.create','users.update','users.delete',
  'roles.read','roles.create','roles.update','roles.delete',
  'categories.read','categories.create','categories.update','categories.delete',
  'modifiers.read','modifiers.create','modifiers.update','modifiers.delete',
  'products.read','products.create','products.update','products.delete',
  'orders.read','orders.create','orders.update','orders.delete',
  'menu.read','menu.create','menu.update','menu.delete','menu.publish'
]

async function main() {
  // Permisos
  for (const code of PERMS) {
    await prisma.permission.upsert({
      where: { code }, update: {},
      create: { code, name: code.toUpperCase() }
    })
  }

  // ADMIN con todos los permisos
  const admin = await prisma.role.upsert({
    where: { name: 'ADMIN' },           // ✅ mismo casing
    update: {},
    create: { name: 'ADMIN', description: 'Acceso total' }
  })
  const allPerms = await prisma.permission.findMany()
  await prisma.rolePermission.deleteMany({ where: { roleId: admin.id }})
  if (allPerms.length) {
    await prisma.rolePermission.createMany({
      data: allPerms.map(p => ({ roleId: admin.id, permissionId: p.id })),
      skipDuplicates: true
    })
  }

  // MESERO con permisos mínimos
  const mesero = await prisma.role.upsert({
    where: { name: 'MESERO' },
    update: {},
    create: { name: 'MESERO', description: 'Operación en piso' }
  })
  const meseroPerms = await prisma.permission.findMany({
    where: { code: { in: ['categories.read', 'modifiers.read', 'menu.read', 'orders.read', 'orders.create', 'orders.update'] } }
  })
  await prisma.rolePermission.deleteMany({ where: { roleId: mesero.id }})
  if (meseroPerms.length) {
    await prisma.rolePermission.createMany({
      data: meseroPerms.map(p => ({ roleId: mesero.id, permissionId: p.id })),
      skipDuplicates: true
    })
  }
}

main().finally(() => prisma.$disconnect())
