import { PrismaClient } from '@prisma/client'
import { ROLES } from '../src/lib/rbac'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create roles
  for (const roleData of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { id: roleData.id },
      update: {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      },
      create: {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      },
    })
    console.log(`Created/updated role: ${role.name}`)
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
