export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side
    return "";
  }

  // Server-side
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
