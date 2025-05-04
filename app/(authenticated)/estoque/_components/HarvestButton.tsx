"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import NewHarwestModal from "./NewHarwestModal"
import { useState } from "react";

const HarwestButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Colheita
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewHarwestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default HarwestButton