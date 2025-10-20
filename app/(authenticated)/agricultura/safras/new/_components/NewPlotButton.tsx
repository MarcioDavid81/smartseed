"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NewPlotModal from "@/app/(authenticated)/dashboard/_components/NewPlotModal";

const NewPlotButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setIsOpen(true)} className=" bg-green text-white" type="button">
                <PlusIcon size={20} />
                Talhão
            </Button>
            <NewPlotModal isOpen={isOpen} onClose={() => setIsOpen(false)}  />
        </div>
    )
}

export default NewPlotButton