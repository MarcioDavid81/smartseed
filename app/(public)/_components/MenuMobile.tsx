"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";


const internalLinks = [
  { name: "Home", href: "/" },
  { name: "Sobre", href: "#about" },
  { name: "Planos", href: "#planos" },
  { name: "Contato", href: "#contact" },
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
