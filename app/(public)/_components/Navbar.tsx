"use client";

import { AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import MenuMobile from "./MenuMobile";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/">
          <Image
            src={Logo}
            alt="Smart Seed"
            width={200}
            height={100}
            className="rounded-full"
          />
        </Link>
        <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
          <li>
            <a href="#home" className="hover:text-green-600">
              Home
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-green-600">
              Sobre
            </a>
          </li>
          <li>
            <a href="#services" className="hover:text-green-600">
              Serviços
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-green-600">
              Contato
            </a>
          </li>
        </ul>
        <button
          className="md:hidden text-green-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>
      <AnimatePresence>
        {isOpen && <MenuMobile onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
