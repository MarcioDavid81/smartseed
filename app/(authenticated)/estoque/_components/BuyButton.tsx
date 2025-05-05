"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewBuyModal from "./NewBuyModal";
import { useStock } from "@/contexts/StockContext";

const BuyButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { fetchCultivars } = useStock();
    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Compra
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewBuyModal isOpen={isOpen} onClose={() => setIsOpen(false)} onHarvestCreated={fetchCultivars} />
        </div>
    )
}

export default BuyButton