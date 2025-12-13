import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "./lib/auth";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // ===============================
  // 🔓 SE USUÁRIO LOGADO REDIRECIONA PRO DASHBOARD
  // ===============================
  if (pathname === "/"  && token) {
    try {
      await jwtVerify(token, getJwtSecretKey());
      console.log("[middleware] Token válido, redirecionando para /dashboard");
      return NextResponse.redirect(
        new URL("/dashboard", req.url),
      );
    } catch {
      return NextResponse.next();
    }
  }

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
          new URL("/dashboard", req.url),
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
    return NextResponse.redirect(new URL("/login", req.url));
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
        new URL("/unauthorized", req.url),
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.log("[middleware] Token inválido, redirecionando para login");
    return NextResponse.redirect(new URL("/login", req.url));
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
