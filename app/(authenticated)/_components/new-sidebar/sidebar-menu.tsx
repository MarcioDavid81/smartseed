"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { routes } from "./menu-data";
import { useState, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarMenuProps {
  isOpen: boolean;
}

function isRouteActive(pathname: string, href?: string) {
  if (!href) return false;

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarMenu({ isOpen }: SidebarMenuProps) {
  const { user } = useUser();
  const pathname = usePathname();

  const currentRoute = useMemo(() => {
    return routes.find((route) => {
      // rota simples
      if (route.path && isRouteActive(pathname, route.path)) {
        return true;
      }

      // subrotas
      if (route.subRoutes) {
        return route.subRoutes.some((sub) =>
          isRouteActive(pathname, sub.path)
        );
      }

      return false;
    });
  }, [pathname]);

  // módulo ativo vem da URL
  const activeMenu = currentRoute?.name ?? null;

  // estado apenas visual (abrir/fechar painel)
  const [openedMenu, setOpenedMenu] = useState<string | null>(null);

  return (
    <div className="relative h-full">
      {/* Ícones principais */}
      <div className={`flex flex-col gap-2 pt-4 ${!isOpen ? "items-center" : "px-3"}`}>
        {routes.map((route) => {
          if (route.adminOnly && user?.role !== "ADMIN") return null;

          const hasSubRoutes = !!route.subRoutes;
          const isActive = route.name === activeMenu;

          return (
            <TooltipProvider key={route.name} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {hasSubRoutes ? (
                      <button
                        onClick={() =>
                          setOpenedMenu(openedMenu === route.name ? null : route.name)
                        }
                        className={`flex items-center text-white rounded-lg px-1 py-2 transition-all duration-200 ${
                          !isOpen ? "justify-center h-12 w-12" : "w-full px-3"
                        } ${
                          isActive
                            ? "bg-green shadow-lg"
                            : "hover:bg-green"
                        }`}
                      >
                        {route.icon}
                        <span className={`ml-3 text-sm font-thin ${!isOpen ? "hidden" : ""}`}>
                          {route.name}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={route.path || "#"}
                        className={`flex items-center text-white rounded-lg px-1 py-2 transition-all duration-200 ${
                          !isOpen ? "justify-center h-12 w-12" : "w-full px-3"
                        } ${
                          isActive
                            ? "bg-green shadow-lg"
                            : "hover:bg-green"
                        }`}
                      >
                        {route.icon}
                        <span className={`ml-3 text-sm font-thin ${!isOpen ? "hidden" : ""}`}>
                          {route.name}
                        </span>
                      </Link>
                    )}
                  </div>
                </TooltipTrigger>

                {!isOpen && (
                  <TooltipContent side="right">
                    {route.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Painel lateral flutuante */}
      <AnimatePresence>
        {openedMenu && (
          <motion.div
            key="submenu"
            initial={{ x: -5000 }}
            animate={{ x: 0 }}
            exit={{ x: -5000 }}
            transition={{ duration: 0.5 }}
            className={`fixed ${
              isOpen ? "left-[223px]" : "left-[62px]"
            } top-[76px] h-[calc(100%-76px)] ${
              isOpen ? "w-[calc(100%-225px)]" : "w-[calc(100%-64px)]"
            } bg-found z-[99] rounded-r-3xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl text-green">{openedMenu}</h3>
                <ArrowRight size={24} className="text-green" />
              </div>

              <Button
                variant="ghost"
                onClick={() => setOpenedMenu(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
              >
                <X size={16} />
              </Button>
            </div>

            <Separator />

            {/* Subrotas */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {routes
                  .find((r) => r.name === openedMenu)
                  ?.subRoutes?.map((sub) => {
                    const subActive = isRouteActive(pathname, sub.path);

                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        onClick={() => setOpenedMenu(null)}
                        className={`group flex items-center gap-2 transition-all duration-200 ${
                          subActive ? "text-green" : "text-white hover:text-green"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                            subActive ? "bg-green/20" : "bg-found"
                          }`}
                        >
                          {sub.icon}
                        </div>

                        <span className="font-light">{sub.name}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
