"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaClipboardList, FaSpinner, FaSeedling, FaTruck } from "react-icons/fa";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaHandshakeSimple } from "react-icons/fa6";
import { PiGrainsFill } from "react-icons/pi";
import { useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/contexts/UserContext";
import { UserMenu } from "./UserMenu";

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
    icon: <FaTruck size={20} />,
  },
  {
    path: "/products",
    name: "Produtos",
    icon: <PiGrainsFill size={24} />,
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
      } bg-found text-text  flex-col justify-between p-6 space-y-6 sticky top-0 min-h-screen transition-all duration-300 ease-in-out hidden md:flex`}
    >
      <div className={`absolute -right-3 top-5 cursor-pointer rounded-full  bg-gray-50 dark:bg-primary p-1 text-primary dark:text-secondary ${
          !isOpen && "rotate-180"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
      <PanelRightOpen className="h-6 w-6" />
      </div>
      
      <div>
        <div className="text-2xl font-bold border-b-2 pb-4 border-zinc-500">
          {isOpen ? (
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={200} 
              height={50} 
              priority
            />
          ) : (
            <Image 
              src="/logo2.png" 
              alt="Logo" 
              width={500} 
              height={500} 
              priority
            />
          )}
        </div>
        
        <nav className="space-y-4 mt-4 flex flex-col border-b-2 border-zinc-500 pb-4">
          {routes.map((route) => (
            <TooltipProvider key={route.path} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Link
                      href={route.path}
                      className={`flex items-center p-2 rounded-lg hover:bg-green hover:text-secondary ${
                        pathname === route.path ? "bg-secondary text-primary" : ""
                      }`}
                    >
                      {route.icon}
                      <span className={`ml-3 duration-300 ${!isOpen && "hidden"}`}>
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
      <div className="flex flex-col items-center">
      <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;