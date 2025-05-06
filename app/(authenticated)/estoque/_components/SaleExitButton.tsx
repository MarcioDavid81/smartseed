"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewSaleExitModal from "./NewSaleExitModal";
import { useStock } from "@/contexts/StockContext";

const NewSaleButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { fetchCultivars } = useStock();
    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Venda
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewSaleExitModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSaleCreated={fetchCultivars} />
        </div>
    )
}

export default NewSaleButton