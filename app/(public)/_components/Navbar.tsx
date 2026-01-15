"use client";

import { useEffect, useState } from "react";
import MenuMobile from "./MenuMobile";
import Image from "next/image";
import Logo from "../../../public/5.png";
import LogoScroll from "../../../public/4.png";
import Link from "next/link";

const internalLinks = [
  { name: "Home", href: "/" },
  { name: "Sobre", href: "#about" },
  { name: "Planos", href: "#planos" },
  { name: "Contato", href: "#contact" },
];

const Navbar = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Executa uma vez na montagem
    handleScroll();

    // Remove o listener quando o componente for desmontado
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="flex items-center justify-center">
      <nav className={`fixed top-4 w-full rounded-2xl z-50 transition-all duration-300 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isScrolling ? "bg-white/20 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}>
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            {isScrolling ? (
              <Image
                src={LogoScroll}
                alt="Smart Seed"
                width={200}
                height={100}
                className="rounded-full"
              />
            ) : (
              <Image
                src={Logo}
                alt="Smart Seed"
                width={200}
                height={100}
                className="rounded-full"
              />
            )}
          </Link>
          <ul className={`hidden md:flex space-x-6 text-lg ${isScrolling ? "text-gray-900" : "text-white"}`}>
            {internalLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-green" aria-label={`Ir para ${link.name}`}>{link.name}</Link>
              </li>
            ))}
          </ul>
          <div className="md:hidden">
            <MenuMobile />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
