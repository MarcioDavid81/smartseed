"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewConsumptionModal from "./NewConsumptionModal";
import { useStock } from "@/contexts/StockContext";

const ConsumptionButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { fetchCultivars } = useStock();
    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Consumo
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewConsumptionModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConsumptionCreated={fetchCultivars} />
        </div>
    )
}

export default ConsumptionButton