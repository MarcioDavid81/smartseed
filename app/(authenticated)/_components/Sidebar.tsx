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
      } bg-found text-text  flex-col  sticky top-0 min-h-screen transition-all duration-300 ease-in-out hidden md:flex`}
    >
      <div
        className={`absolute -right-4 top-[50px] cursor-pointer rounded-full  bg-background dark:bg-primary p-1 text-primary dark:text-secondary ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PanelRightOpen className="h-6 w-6 text-green" />
      </div>

      <div className="text-2xl flex items-center justify-center bg-green font-bold border-b-2 pt-2 pb-4 border-zinc-500">
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
        <nav className="space-y-4 mt-4 flex flex-col border-b-2 border-zinc-500 pb-4">
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
                          className={`flex text-white items-center ${
                            !isOpen && "justify-center"
                          } py-2 px-1 rounded-lg hover:bg-green hover:text-white`}
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
      <div className="flex flex-col items-center absolute bottom-4">
        <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;
