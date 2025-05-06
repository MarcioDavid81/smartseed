"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewBeneficiationModal from "./NewBeneficiationModal";
import { useStock } from "@/contexts/StockContext";

const BeneficiationButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { fetchCultivars } = useStock();
    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Descarte
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewBeneficiationModal isOpen={isOpen} onClose={() => setIsOpen(false)} onBeneficiotionCreated={fetchCultivars} />
        </div>
    )
}

export default BeneficiationButton