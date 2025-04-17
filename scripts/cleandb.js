const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    await prisma.item.deleteMany();
    await prisma.shoppingList.deleteMany();
    
    console.log('✅ Banco de dados limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();