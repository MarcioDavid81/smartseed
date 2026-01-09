"use client"

import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const AcquirePlanButton = () => {
  const hasPremiumPlan = true;
  const handleAcquirePlanClick = () => {
    window.open(
      "/",
      "_blank"
    );
  };
  if (hasPremiumPlan) {
    return (
      <HoverButton className="w-full rounded-full font-bold flex items-center justify-center gap-2">
        <Link
          href=""
          onClick={handleAcquirePlanClick}
        >
          Gerenciar plano
        </Link>
      </HoverButton>
    );
  }
  return (
    <HoverButton
      className="w-full rounded-full font-bold flex items-center justify-center gap-2"
      onClick={handleAcquirePlanClick}
    >
      <ShoppingCart className="mr-2" size={16} />
      Adquirir plano
    </HoverButton>
  );
}
 
export default AcquirePlanButton;