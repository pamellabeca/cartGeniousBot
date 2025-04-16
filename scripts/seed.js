const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categorias = [
        "mercearia",
        "limpeza",
        "proteínas",
        "laticínios",
        "utilidades",
        "higiene",
        "bebidas",
        "frutas verduras e legumes",
        "outros"
    ]

  for (const name of categorias) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }

  console.log('Categorias inseridas com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
