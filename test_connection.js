import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados Neon estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao conectar ao banco de dados Neon:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
