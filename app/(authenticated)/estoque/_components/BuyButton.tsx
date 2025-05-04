"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewBuyModal from "./NewBuyModal";

const BuyButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Compra
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewBuyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default BuyButton