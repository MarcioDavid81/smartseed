"use client"

import HoverButton from "@/components/HoverButton"
import {  PlusIcon } from "lucide-react"
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertHarvestModal from "./UpsertHarvestModal";

const CreateHarvestButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    const { fetchCultivars } = useStock();
    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                <PlusIcon size={20} />
                Colheita
            </HoverButton>
            <UpsertHarvestModal isOpen={isOpen} onClose={() => setIsOpen(false)} onHarvestCreated={fetchCultivars} />
        </div>
    )
}

export default CreateHarvestButton