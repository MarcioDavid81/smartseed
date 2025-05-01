export function getJwtSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length === 0) {
      throw new Error("JWT_SECRET não definido nas variáveis de ambiente.");
    }
    return new TextEncoder().encode(secret);
  }