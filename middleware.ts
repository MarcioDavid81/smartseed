import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "./lib/auth";
import { Role } from "@prisma/client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  console.log("[middleware] Path:", pathname);
  console.log("[middleware] Token presente?", !!token);

  const publicPaths = ["/", "/login"];

  // ===============================
  // 🔓 ROTAS PÚBLICAS
  // ===============================
  if (publicPaths.includes(pathname)) {
    if (token) {
      try {
        await jwtVerify(token, getJwtSecretKey());
        console.log("[middleware] Token válido, redirecionando para /dashboard");
        return NextResponse.redirect(
          new URL("/dashboard", request.url),
        );
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // ===============================
  // 🔐 TODAS AS OUTRAS ROTAS
  // ===============================
  if (!token) {
    console.log("[middleware] Sem token, redirecionando para login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    const role = payload.role as Role;

    console.log("[middleware] Token válido | Role:", role);

    // ===============================
    // 🚨 ROTAS SOMENTE ADMIN
    // ===============================
    const adminRoutes = [
      "/cadastros/usuarios",
      "/cadastros/empresas",
    ];

    const isAdminRoute = adminRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (isAdminRoute && role !== Role.ADMIN) {
      console.log("[middleware] Acesso negado por role");

      return NextResponse.redirect(
        new URL("/unauthorized", request.url),
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.log("[middleware] Token inválido, redirecionando para login");
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/login",
    "/cadastro",
    "/dashboard/:path*",
    "/sementes",
    "/producao",
    "/movimentacoes/:path*",
    "/estoque",
    "/cadastros/:path*",
    "/swagger",
    "/insumos/:path*",
    "/financeiro/:path*",
    "/agricultura/:path*",
    "/maquinas/:path*",
  ],
};
