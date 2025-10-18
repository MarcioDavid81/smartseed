"use client";

import Image from "next/image";
import Link from "next/link";
import { FaSeedling, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { useState } from "react";
import {
  DollarSign,
  PanelRightOpen,
  Scroll,
  ShoppingCart,
  Trash2,
  Warehouse,
  PackageSearch,
  ChartNoAxesCombined,
  BanknoteArrowUp,
  BanknoteArrowDown,
  Home,
} from "lucide-react";
import { PiFarm } from "react-icons/pi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "./UserMenu";
import { SidebarCollapsibleItem } from "./CollapsibleMenu";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";
import { Building2, User } from "lucide-react";
import { TbTransferIn } from "react-icons/tb";
import { GiFarmTractor } from "react-icons/gi";
import combineIcon from "../../../public/combine.ico";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    name: "Insumos",
    icon: <PiFarm size={20} />,
    subRoutes: [
      {
        path: "/insumos/compras",
        name: "Compra",
        icon: <ShoppingCart size={16} />,
      },
      {
        path: "/insumos/aplicacoes",
        name: "Aplicação",
        icon: <GiFarmTractor size={16} />,
      },
      {
        path: "/insumos/transferencias",
        name: "Transferência",
        icon: <TbTransferIn size={16} />,
      },
      {
        path: "/insumos/estoque",
        name: "Estoque",
        icon: <Warehouse size={16} />,
      },
      {
        path: "/insumos/produtos",
        name: "Produtos",
        icon: <PackageSearch size={16} />,
      },
    ],
  },
  {
    name: "Sementes",
    icon: <FaSeedling size={20} />,
    subRoutes: [
      {
        path: "/sementes/colheitas",
        name: "Colheita",
        icon: <Image src={combineIcon} alt="Agricultura" width={20} height={20} />,
      },
      {
        path: "/sementes/compras",
        name: "Compra",
        icon: <ShoppingCart size={16} />,
      },
      {
        path: "/sementes/vendas",
        name: "Venda",
        icon: <DollarSign size={16} />,
      },
      {
        path: "/sementes/consumos",
        name: "Plantio",
        icon: <GiFarmTractor size={16} />,
      },
      {
        path: "/sementes/descartes",
        name: "Descarte",
        icon: <Trash2 size={16} />,
      },
      {
        path: "/sementes/cultivares",
        name: "Cultivares",
        icon: <FaSeedling size={16} />,
      },
      {
        path: "/sementes/estoque",
        name: "Estoque",
        icon: <Warehouse size={16} />,
      },
    ],
  },
  {
    name: "Agricultura",
    icon: <GiFarmTractor size={20} />,
    subRoutes: [
      {
        path: "/agricultura/dashboard",
        name: "Dashboard",
        icon: <AiOutlineDashboard size={20} />,
      },
      {
        path: "/agricultura/colheitas",
        name: "Colheita",
        icon: <Image src={combineIcon} alt="Agricultura" width={24} height={24} />,
      },
      {
        path: "/agricultura/transportadores",
        name: "Transportadores",
        icon: <FaTruck size={16} />,
      },
      {
        path: "/agricultura/depositos",
        name: "Depósitos",
        icon: <Home size={16} />,
      },
      {
        path: "/agricultura/estoque",
        name: "Estoque",
        icon: <Warehouse size={16} />,
      },
    ],
  },
  {
    name: "Financeiro",
    icon: <ChartNoAxesCombined size={20} />,
    subRoutes: [
      {
        path: "/financeiro/dashboard",
        name: "Dashboard",
        icon: <AiOutlineDashboard size={16} />,
      },
      {
        path: "/financeiro/contas-a-pagar",
        name: "Contas à Pagar",
        icon: <BanknoteArrowUp size={16} />,
      },
      {
        path: "/financeiro/contas-a-receber",
        name: "Contas à Receber",
        icon: <BanknoteArrowDown size={16} />,
      },
    ],
  },
  {
    name: "Cadastros",
    icon: <Scroll size={20} />,
    subRoutes: [
      {
        path: "/cadastros/empresas",
        name: "Empresas",
        icon: <Building2 size={16} />,
      },
      {
        path: "/cadastros/usuarios",
        name: "Usuários",
        icon: <User size={16} />,
      },
    ],
    adminOnly: true, // 🔑 só renderiza se role for ADMIN
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useUser();
  const pathname = usePathname();
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } sticky top-0 hidden max-h-screen flex-col bg-found text-text transition-all duration-300 ease-in-out md:flex`}
    >
      {/* Botão de expandir/retrair */}
      <div
        className={`absolute -right-4 top-[50px] cursor-pointer rounded-full bg-background p-1 text-primary dark:bg-primary dark:text-secondary ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PanelRightOpen className="h-6 w-6 text-green" />
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center border-b-2 border-zinc-500 bg-green pb-4 pt-2 text-2xl font-bold">
        <Link href="/">
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

      {/* Menu */}
      <div className="p-2">
        <nav className="mt-4 flex flex-col space-y-4 border-b-2 border-zinc-500 pb-4">
          {routes.map((route, index) => {
            if (route.subRoutes) {
              if (route.adminOnly && user?.role !== "ADMIN") return null; // 🔑 só admin vê
              return (
                <SidebarCollapsibleItem
                  key={index}
                  icon={route.icon}
                  name={route.name}
                  subRoutes={route.subRoutes}
                  isSidebarOpen={isOpen}
                  open={openItem === route.name}
                  onOpenChange={(isOpen) =>
                    setOpenItem(isOpen ? route.name : null)
                  }
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
                          } rounded-lg px-1 py-2 hover:bg-green hover:text-white ${
                            pathname === route.path ? "bg-green" : ""
                          }`}
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

      {/* Menu do usuário */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;
