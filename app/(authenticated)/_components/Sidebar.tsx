"use client";

import Image from "next/image";
import Link from "next/link";
import { FaHome, FaSeedling, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { useState } from "react";
import { PanelRightOpen, Scroll, Warehouse } from "lucide-react";
import { PiFarm } from "react-icons/pi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "./UserMenu";
import { SidebarCollapsibleItem } from "./CollapsibleMenu";
import { AdminCollapsibleItem } from "./AdminCollapsibleMenu";
import { useUser } from "@/contexts/UserContext";

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
    path: "/producao",
    name: "Produção",
    icon: <PiFarm size={20} />,
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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useUser();
  console.log("Usuário logado:", user);
  console.log("Role:", user?.role);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } sticky top-0 hidden min-h-screen flex-col bg-found text-text transition-all duration-300 ease-in-out md:flex`}
    >
      <div
        className={`absolute -right-4 top-[50px] cursor-pointer rounded-full bg-background p-1 text-primary dark:bg-primary dark:text-secondary ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PanelRightOpen className="h-6 w-6 text-green" />
      </div>

      <div className="flex items-center justify-center border-b-2 border-zinc-500 bg-green pb-4 pt-2 text-2xl font-bold">
        <Link href="/dashboard">
          {isOpen ? (
            <Image
              src="/logo3.png"
              alt="Logo"
              width={200}
              height={50}
              priority
            />
          ) : (
            <Image
              src="/logo4.png"
              alt="Logo"
              width={40}
              height={40}
              priority
            />
          )}
        </Link>
      </div>
      <div className="p-2">
        <nav className="mt-4 flex flex-col space-y-4 border-b-2 border-zinc-500 pb-4">
          {routes.map((route, index) => {
            if (route.subRoutes) {
              return (
                <SidebarCollapsibleItem
                  key={index}
                  icon={route.icon}
                  name={route.name}
                  subRoutes={route.subRoutes}
                  isSidebarOpen={isOpen}
                />
              );
            }

            if (route.adminRoutes && user?.role === "ADMIN") {
              return (
                <AdminCollapsibleItem
                  key={index}
                  icon={route.icon}
                  name={route.name}
                  subRoutes={route.adminRoutes}
                  isSidebarOpen={isOpen}
                />
              );
            }

            if (route.path) {
              return (
                <TooltipProvider key={route.path} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Link
                          href={route.path}
                          className={`flex items-center text-white ${
                            !isOpen && "justify-center"
                          } rounded-lg px-1 py-2 hover:bg-green hover:text-white`}
                        >
                          {route.icon}
                          <span
                            className={`ml-3 text-sm font-thin hover:text-white ${
                              !isOpen && "hidden"
                            }`}
                          >
                            {route.name}
                          </span>
                        </Link>
                      </div>
                    </TooltipTrigger>
                    {!isOpen && (
                      <TooltipContent side="right">{route.name}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return null;
          })}
        </nav>
      </div>
      <div className="absolute bottom-4 flex flex-col items-center">
        <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;
