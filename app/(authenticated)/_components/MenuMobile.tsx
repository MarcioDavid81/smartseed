"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Scroll, Warehouse } from "lucide-react";
import { FaHome, FaSeedling, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { PiFarm } from "react-icons/pi";
import { useUser } from "@/contexts/UserContext";
import LogoutButton from "./LogoutButton";
import Image from "next/image";

const routes = [
  {
    path: "/",
    name: "Início",
    icon: <FaHome size={20} />,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    path: "/sementes",
    name: "Sementes",
    icon: <FaSeedling size={20} />,
  },
  {
    name: "Insumos",
    icon: <PiFarm size={20} />,
    subRoutes: [
      { path: "/insumos/aplicacoes", name: "Aplicação" },
      { path: "/insumos/compras", name: "Compra" },
      { path: "/insumos/transferencias", name: "Transferência" },
      { path: "/insumos/estoque", name: "Estoque" },
      { path: "/insumos/produtos", name: "Produtos" },
    ],
  },
  {
    name: "Movimentações",
    icon: <FaTruck size={20} />,
    subRoutes: [
      { path: "/movimentacoes/colheitas", name: "Colheita" },
      { path: "/movimentacoes/compras", name: "Compra" },
      { path: "/movimentacoes/vendas", name: "Venda" },
      { path: "/movimentacoes/consumos", name: "Consumo" },
      { path: "/movimentacoes/descartes", name: "Descarte" },
    ],
  },
  {
    path: "/estoque",
    name: "Estoque",
    icon: <Warehouse size={20} />,
  },
  {
    name: "Cadastros",
    icon: <Scroll size={20} />,
    adminRoutes: [
      { path: "/cadastros/empresas", name: "Empresas" },
      { path: "/cadastros/usuarios", name: "Usuários" },
    ],
  },
];

export function MobileMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-green p-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <Image
            src="/logo3.png"
            alt="Logo"
            width={100}
            height={40}
            className="rounded-full"
          />
          <SheetTrigger asChild>
            <Button variant="ghost">
              <Menu size={40} className="text-white" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 mb-20 space-y-4">
            {routes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      {route.icon}
                      {route.name}
                    </div>
                    <div className="ml-4 mt-1 space-y-2">
                      {route.subRoutes.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={() => setOpen(false)}
                          className="block text-sm text-muted-foreground hover:text-primary"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (route.adminRoutes && user?.role === "ADMIN") {
                return (
                  <div key={index}>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                      {route.icon}
                      {route.name}
                    </div>
                    <div className="ml-4 mt-1 space-y-2">
                      {route.adminRoutes.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={() => setOpen(false)}
                          className="block text-sm text-muted-foreground hover:text-primary"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              if (route.path) {
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                  >
                    {route.icon}
                    {route.name}
                  </Link>
                );
              }

              return null;
            })}
          </nav>
          <div>
              <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
