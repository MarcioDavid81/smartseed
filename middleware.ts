import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Páginas públicas sem proteção, exceto /login
const publicRoutes = ["/", "/register", "/api/auth/login", "/api/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  console.log("[middleware] pathname:", pathname);
  console.log("[middleware] token presente?", !!token);

  // Bloqueia acesso ao /login se já estiver autenticado
  if (pathname.startsWith("/login") && token) {
    try {
      verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Token inválido, deixa ir pro login
      return NextResponse.next();
    }
  }

  // Permite o acesso às rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Se não há token e a rota é protegida
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
