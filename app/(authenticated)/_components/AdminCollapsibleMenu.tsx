"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Building2, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { SidebarSubItem } from "./SidebarSubItem";

interface AdminRoute {
  path: string;
  name: string;
}

interface SidebarCollapsibleItemProps {
  icon: React.ReactNode;
  name: string;
  subRoutes: AdminRoute[];
  isSidebarOpen: boolean;
}

const children = [
  {
    name: "Empresas",
    href: "/cadastros/empresas",
    icon: <Building2 size={16} />,
  },
  {
    name: "Usuários",
    href: "/cadastros/usuarios",
    icon: <User size={16} />,
  },
];

export const AdminCollapsibleItem = ({
  icon,
  name,
  subRoutes,
  isSidebarOpen,
}: SidebarCollapsibleItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <div
                className={`flex items-center text-white py-2 px-2 rounded-lg hover:bg-green cursor-pointer ${
                  isSidebarOpen ? "justify-between" : "justify-center"
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    !isSidebarOpen && "justify-center w-full"
                  }`}
                >
                  {icon}
                  {isSidebarOpen && (
                    <span className="text-sm font-thin">{name}</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>
            </CollapsibleTrigger>
          </TooltipTrigger>

          {!isSidebarOpen && (
            <TooltipContent side="right">
              <p>{name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* {isSidebarOpen && ( */}
      <CollapsibleContent
        className={`${isSidebarOpen ? "flex flex-col gap-1 ml-8" : ""}`}
      >
        {children.map((child) => (
          <SidebarSubItem
            key={child.href}
            name={child.name}
            href={child.href}
            icon={child.icon}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </CollapsibleContent>
      {/* // )} */}
    </Collapsible>
  );
};
