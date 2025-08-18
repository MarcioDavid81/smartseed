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
import { ChevronDown } from "lucide-react";
import { SidebarSubItem } from "./SidebarSubItem";

interface SubRoute {
  path: string;
  name: string;
  icon?: React.ReactNode;
}

interface SidebarCollapsibleItemProps {
  icon: React.ReactNode;
  name: string;
  subRoutes: SubRoute[];
  isSidebarOpen: boolean;
  open: boolean; // 🔹 estado controlado
  onOpenChange: (isOpen: boolean) => void; // 🔹 callback
}

export const SidebarCollapsibleItem = ({
  icon,
  name,
  subRoutes,
  isSidebarOpen,
  open,
  onOpenChange,
}: SidebarCollapsibleItemProps) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <div
                className={`flex cursor-pointer items-center rounded-lg px-2 py-2 text-white hover:bg-green ${
                  isSidebarOpen ? "justify-between" : "justify-center"
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    !isSidebarOpen && "w-full justify-center"
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

      <CollapsibleContent
        className={`${isSidebarOpen ? "ml-8 flex flex-col gap-1" : ""}`}
      >
        {subRoutes.map((route) => (
          <SidebarSubItem
            key={route.path}
            name={route.name}
            href={route.path}
            icon={route.icon}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
