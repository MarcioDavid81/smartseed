"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import Link from 'next/link';

const CreatePurchaseOrderButton = () => {

  return (
    <Link href="/comercial/compras/new">
      <HoverButton>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
    </Link>
  );
};

export default CreatePurchaseOrderButton;