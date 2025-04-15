const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Prisma conectado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar no Prisma:", error);
    }
}

testConnection();

module.exports = prisma;