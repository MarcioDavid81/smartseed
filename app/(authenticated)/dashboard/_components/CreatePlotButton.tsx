"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewPlotModal from "./NewPlotModal";

const CreatePlotButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Talhão
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewPlotModal isOpen={isOpen} onClose={() => setIsOpen(false)}  />
        </div>
    )
}

export default CreatePlotButton