"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const internalLinks = [
  { name: "Home", href: "/" },
  { name: "Como Funciona", href: "#como-funciona" },
  { name: "Planos", href: "#planos" },
  { name: "FAQ", href: "#faq" },
  { name: "Contato", href: "#contato" },
  { name: "Blog", href: "/blog" },
];

const MenuMobile = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="p-0">
            <Menu size={24} className="text-gray-900" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-left">SmartSeed Menu</SheetTitle>
          </SheetHeader>
          <nav className="mb-20 mt-4 space-y-4">
            {internalLinks.map((link) => {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuMobile;
