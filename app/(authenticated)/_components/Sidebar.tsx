"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaClipboardList, FaSpinner, FaSeedling, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaHandshakeSimple } from "react-icons/fa6";
import { PiGrainsFill } from "react-icons/pi";
import { useState } from "react";
import { PanelRightOpen, Warehouse } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";
import { UserMenu } from "./UserMenu";

const routes = [
  {
    path: "/",
    name: "Início",
    icon: <FaHome size={25} />,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: <AiOutlineDashboard size={25} />,
  },
  {
    path: "/sementes",
    name: "Sementes",
    icon: <FaSeedling size={25} />,
  },
  {
    path: "/producao",
    name: "Produção",
    icon: <FaTruck size={25} />,
  },
  {
    path: "/estoque",
    name: "Estoque",
    icon: <Warehouse size={25} />,
  },
];


const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const {user} = useUser();

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-found text-text  flex-col  sticky top-0 min-h-screen transition-all duration-300 ease-in-out hidden md:flex`}
    >
      <div className={`absolute -right-4 top-[50px] cursor-pointer rounded-full  bg-background dark:bg-primary p-1 text-primary dark:text-secondary ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
      <PanelRightOpen className="h-6 w-6 text-green" />
      </div>
      
        <div className="text-2xl flex items-center justify-center bg-green font-bold border-b-2 pt-2 pb-4 border-zinc-500">
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
              width={50} 
              height={50} 
              priority
            />
          )}
        </div>
      <div className="p-2">
        
        <nav className="space-y-8 mt-4 flex flex-col border-b-2 border-zinc-500 pb-4">
          {routes.map((route) => (
            <TooltipProvider key={route.path} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Link
                      href={route.path}
                      className={`flex text-white items-center ${!isOpen && "justify-center"} py-2 px-1 rounded-lg hover:bg-green hover:text-white`}
                    >
                      {route.icon}
                      <span className={`ml-3 text-sm font-light hover:text-white ${!isOpen && "hidden"}`}>
                        {route.name}
                      </span>
                    </Link>
                  </div>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" className="bg-hover text-text">
                    {route.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </div>
      <div className="flex flex-col items-center absolute bottom-4">
      <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;