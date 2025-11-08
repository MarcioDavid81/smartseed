"use client";

import Image from "next/image";
import { SidebarMenu } from "./sidebar-menu";
import { UserMenu } from "../UserMenu";
import { useState } from "react";
import { PanelRightOpen } from "lucide-react";
import Link from "next/link";

export default function NewSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <aside className={`hidden relative z-50 md:flex h-screen ${isOpen ? "w-64" : "w-16"} flex-col bg-found text-text transition-all duration-300`}>
      <div
        className={`absolute -right-4 top-[50px] cursor-pointer rounded-full bg-background p-1 text-primary dark:bg-primary dark:text-secondary transition-transform duration-300 z-[100] ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PanelRightOpen className="h-6 w-6 text-green" />
      </div>
      
      {/* Logo */}
      <div className="flex items-center justify-center h-[78px] bg-green pb-4 pt-2 text-2xl font-bold">
        <Link href="/">
          {isOpen ? (
            <Image
              src="/logonovo.png"
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

      {/* Menus principais */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-transparent">
        <SidebarMenu isOpen={isOpen} />
      </div>

      {/* Menu do usuário */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <UserMenu />
      </div>
    </aside>
  );
}
