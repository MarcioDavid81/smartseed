"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewBeneficiationModal from "./NewBeneficiationModal";

const BeneficiationButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Descarte
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewBeneficiationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default BeneficiationButton