"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import Link from 'next/link';

const CreateSaleContractButton = () => {

  return (
    <Link href="/comercial/vendas/new">
      <HoverButton>
        <PlusIcon size={20} />
        Venda
      </HoverButton>
    </Link>
  );
};

export default CreateSaleContractButton;
