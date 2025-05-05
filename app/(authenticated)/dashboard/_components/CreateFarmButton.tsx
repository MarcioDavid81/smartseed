"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewFarmModal from "./NewFarmModal";

const CreateFarmButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Fazenda
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewFarmModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    )
}

export default CreateFarmButton