'use client';

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

interface SidebarSubItemProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  isSidebarOpen: boolean;
}

export function SidebarSubItem({ name, href, icon, isSidebarOpen }: SidebarSubItemProps) {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={`flex items-center gap-2 text-sm font-extralight mt-2 p-2 rounded-md hover:bg-green text-white transition-all
              ${isSidebarOpen ? "justify-start" : "justify-center"}
              ${pathname === href ? "bg-green" : ""}
            `}
          >
            {icon}
            {isSidebarOpen && <span>{name}</span>}
          </Link>
        </TooltipTrigger>
        {!isSidebarOpen && (
          <TooltipContent side="right" className="text-xs">
            {name}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
