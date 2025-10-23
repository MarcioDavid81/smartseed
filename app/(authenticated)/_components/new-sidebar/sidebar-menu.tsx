"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { routes } from "./menu-data";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarMenuProps {
  isOpen: boolean;
}

export function SidebarMenu({ isOpen }: SidebarMenuProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="relative h-full">
      {/* Ícones principais */}
      <div className={`flex flex-col gap-2 pt-4 ${!isOpen ? 'items-center' : 'px-3'}`}>
        {routes.map((route) => {
          if (route.adminOnly && user?.role !== "ADMIN") return null;

          const hasSubRoutes = !!route.subRoutes;
          const isActive = hasSubRoutes 
            ? activeMenu === route.name 
            : pathname === route.path;

          return (
            <TooltipProvider key={route.name} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {hasSubRoutes ? (
                      <button
                        onClick={() => setActiveMenu(activeMenu === route.name ? null : route.name)}
                        className={`flex items-center text-white rounded-lg px-1 py-2 transition-all duration-200 ${
                          !isOpen ? "justify-center h-12 w-12" : "w-full px-3"
                        } ${
                          isActive 
                            ? "bg-green shadow-lg" 
                            : "hover:bg-green"
                        }`}
                      >
                        {route.icon}
                        <span 
                          className={`ml-3 text-sm font-thin ${
                            !isOpen ? "hidden" : ""
                          }`}
                        >
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
                        <span 
                          className={`ml-3 text-sm font-thin ${
                            !isOpen ? "hidden" : ""
                          }`}
                        >
                          {route.name}
                        </span>
                      </Link>
                    )}
                  </div>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" className="bg-found text-white font-thin">
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
        {activeMenu && (
          <motion.div
            key="submenu"
            initial={{ x: -5000 }}
            animate={{ x: 0 }}            
            exit={{ x: -5000 }}
            transition={{ duration: 0.5 }}
            className={`fixed ${isOpen ? "left-[223px]" : "left-[62px]"} top-[76px] h-[calc(100%-76px)] ${isOpen ? "w-[calc(100%-225px)]" : "w-[calc(100%-64px)]"} bg-found z-[99] rounded-r-3xl`}
          >
            {/* Header do submenu */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl text-green">
                  {activeMenu}
                </h3>
                <ArrowRight size={24} className="text-green" />
              </div>
              <Button
                variant="ghost"
                onClick={() => setActiveMenu(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </Button>
            </div>
            <Separator />
            {/* Conteúdo do submenu */}
            <div className="p-6">
              <div className="space-y-3">
                {/* Seções organizadas */}
                <div className="grid grid-cols-3 gap-3">
                  {routes
                    .find((r) => r.name === activeMenu)
                    ?.subRoutes?.map((sub) => (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        onClick={() => setActiveMenu(null)}
                        className={`group hover:text-green flex items-center gap-1 transition-all duration-200 ${
                          pathname === sub.path 
                            ? "text-green" 
                            : "bg-found text-white"
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          pathname === sub.path 
                            ? "bg-found" 
                            : "bg-found"
                        }`}>
                          {sub.icon}
                        </div>
                        <span className="font-light">{sub.name}</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar o menu */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            onClick={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
