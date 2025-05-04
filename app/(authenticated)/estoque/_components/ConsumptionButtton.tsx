"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewConsumptionModal from "./NewConsumptionModal";

const ConsumptionButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Consumo
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewConsumptionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default ConsumptionButton